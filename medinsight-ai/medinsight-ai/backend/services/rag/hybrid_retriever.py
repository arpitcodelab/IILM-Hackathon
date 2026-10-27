"""
MedInsight AI — Hybrid Retriever.
Combines dense semantic vector retrieval (ChromaDB) with sparse keyword
retrieval (BM25) using Reciprocal Rank Fusion (RRF).
"""

import asyncio
import hashlib
import logging
from typing import Optional

from api.models import RetrievedEvidence
from services.rag.bm25_retriever import bm25_retriever
from services.rag.vector_store import vector_store

logger = logging.getLogger("medinsight.rag.hybrid")

RRF_K = 60  # Standard constant for Reciprocal Rank Fusion


def _doc_key(doc: RetrievedEvidence) -> str:
    """Generate a unique key for deduplicating evidence chunks."""
    if doc.chunk_id:
        return doc.chunk_id
    # Fallback to content hash
    return hashlib.sha256(doc.content.strip().encode("utf-8")).hexdigest()


class HybridRetriever:
    """Combines vector and BM25 retrievers with Reciprocal Rank Fusion."""

    def __init__(self, default_top_k: int = 5):
        self.default_top_k = default_top_k
        self._sync_lock = asyncio.Lock()

    async def _ensure_bm25_synced(self) -> None:
        """Ensure BM25 retriever index is populated from the vector store if empty."""
        if bm25_retriever.count() == 0 and (await vector_store.count()) > 0:
            async with self._sync_lock:
                if bm25_retriever.count() == 0:
                    docs = await vector_store.get_all_documents()
                    if docs:
                        bm25_retriever.index_documents(docs)
                        logger.info(f"Synchronized {len(docs)} documents into BM25 retriever.")

    async def retrieve(
        self,
        query: str,
        top_k: Optional[int] = None,
        vector_weight: float = 0.6,
        bm25_weight: float = 0.4,
    ) -> list[RetrievedEvidence]:
        """
        Perform hybrid retrieval combining vector similarity and BM25 scoring.
        """
        if not query or not query.strip():
            return []

        k = top_k or self.default_top_k
        fetch_k = max(k * 2, 10)  # Fetch extra candidates for fusion

        # Ensure BM25 has corpus
        await self._ensure_bm25_synced()

        # Run vector query and BM25 in parallel
        vector_task = vector_store.query(query, n_results=fetch_k)
        bm25_task = asyncio.to_thread(bm25_retriever.retrieve, query, top_k=fetch_k)

        vector_results, bm25_results = await asyncio.gather(vector_task, bm25_task)

        # Build candidate map
        candidates: dict[str, RetrievedEvidence] = {}
        rrf_scores: dict[str, float] = {}

        # Process vector ranks (1-indexed)
        for rank, doc in enumerate(vector_results, start=1):
            key = _doc_key(doc)
            candidates[key] = doc
            contribution = vector_weight / (RRF_K + rank)
            rrf_scores[key] = rrf_scores.get(key, 0.0) + contribution

        # Process BM25 ranks (1-indexed)
        for rank, doc in enumerate(bm25_results, start=1):
            key = _doc_key(doc)
            if key not in candidates:
                candidates[key] = doc
            contribution = bm25_weight / (RRF_K + rank)
            rrf_scores[key] = rrf_scores.get(key, 0.0) + contribution

        if not candidates:
            return []

        # Sort candidates by combined RRF score descending
        sorted_keys = sorted(rrf_scores.keys(), key=lambda k_id: rrf_scores[k_id], reverse=True)
        max_rrf = rrf_scores[sorted_keys[0]] if sorted_keys else 1.0

        fused_results: list[RetrievedEvidence] = []
        for key in sorted_keys[:k]:
            doc = candidates[key]
            # Normalize RRF score to 0..1 range
            normalized = rrf_scores[key] / max_rrf if max_rrf > 0 else 0.0
            fused_results.append(
                RetrievedEvidence(
                    content=doc.content,
                    source_title=doc.source_title,
                    source_publisher=doc.source_publisher,
                    source_url=doc.source_url,
                    source_date=doc.source_date,
                    relevance_score=round(normalized, 4),
                    chunk_id=doc.chunk_id,
                    section=doc.section,
                )
            )

        logger.debug(f"Hybrid retrieval returned {len(fused_results)} documents for query: {query[:40]}...")
        return fused_results


# Global singleton instance
hybrid_retriever = HybridRetriever()
