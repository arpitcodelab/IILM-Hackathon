"""
MedInsight AI — ChromaDB Vector Store.
Manages persistent storage, collection initialization, embedding indexing,
and semantic vector search for medical evidence.
"""

import asyncio
import logging
import uuid
from typing import Any, Optional

import chromadb
from chromadb.config import Settings as ChromaSettings
from config import settings
from api.models import RetrievedEvidence
from services.rag.embeddings import embedding_service

logger = logging.getLogger("medinsight.rag.vector_store")

COLLECTION_NAME = "medical_knowledge"


class VectorStore:
    """ChromaDB persistent vector store for medical knowledge."""

    def __init__(self):
        self._client: Optional[chromadb.PersistentClient] = None
        self._collection = None
        self._initialized = False

    def _init_sync(self) -> None:
        """Synchronously initialize ChromaDB client and collection."""
        if self._initialized and self._collection is not None:
            return

        persist_dir = str(settings.get_chroma_path())
        logger.info(f"Initializing ChromaDB vector store at: {persist_dir}")

        chroma_settings = ChromaSettings(
            anonymized_telemetry=False,
            allow_reset=True,
        )

        self._client = chromadb.PersistentClient(
            path=persist_dir,
            settings=chroma_settings,
        )

        # Get or create collection with cosine similarity
        self._collection = self._client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
        self._initialized = True
        logger.info(f"Vector store initialized. Current document count: {self._collection.count()}")

    async def initialize(self) -> None:
        """Asynchronously initialize the vector store."""
        await asyncio.to_thread(self._init_sync)

    def _ensure_initialized(self) -> None:
        """Ensure client and collection are ready."""
        if not self._initialized or self._collection is None:
            self._init_sync()

    def count_sync(self) -> int:
        """Get total number of chunks in the collection."""
        self._ensure_initialized()
        return self._collection.count()

    async def count(self) -> int:
        """Get document count asynchronously."""
        return await asyncio.to_thread(self.count_sync)

    def add_documents_sync(self, documents: list[RetrievedEvidence]) -> int:
        """
        Add a list of RetrievedEvidence objects to the vector store.
        Embeds content and stores metadata.
        """
        if not documents:
            return 0

        self._ensure_initialized()

        ids: list[str] = []
        texts: list[str] = []
        metadatas: list[dict[str, Any]] = []

        for doc in documents:
            chunk_id = doc.chunk_id or str(uuid.uuid4())
            ids.append(chunk_id)
            texts.append(doc.content)
            metadatas.append({
                "source_title": doc.source_title or "Medical Reference",
                "source_publisher": doc.source_publisher or "Clinical Source",
                "source_url": doc.source_url or "",
                "source_date": doc.source_date or "",
                "section": doc.section or "General",
                "chunk_id": chunk_id,
            })

        logger.info(f"Generating embeddings for {len(texts)} documents...")
        embeddings = embedding_service.get_embeddings_batch_sync(texts, task_type="retrieval_document")

        # Upsert into ChromaDB
        self._collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas,
        )

        logger.info(f"Successfully indexed {len(ids)} documents in vector store.")
        return len(ids)

    async def add_documents(self, documents: list[RetrievedEvidence]) -> int:
        """Add documents asynchronously."""
        return await asyncio.to_thread(self.add_documents_sync, documents)

    def query_sync(
        self,
        query_text: str,
        n_results: int = 5,
        where: Optional[dict[str, Any]] = None,
    ) -> list[RetrievedEvidence]:
        """
        Query vector store for the most relevant evidence chunks.
        """
        if not query_text or not query_text.strip():
            return []

        self._ensure_initialized()
        total_count = self._collection.count()
        if total_count == 0:
            logger.debug("Vector store is empty, returning no results.")
            return []

        actual_n = min(n_results, total_count)
        query_embedding = embedding_service.get_embedding_sync(query_text, task_type="retrieval_query")

        query_kwargs: dict[str, Any] = {
            "query_embeddings": [query_embedding],
            "n_results": actual_n,
            "include": ["documents", "metadatas", "distances"],
        }
        if where:
            query_kwargs["where"] = where

        results = self._collection.query(**query_kwargs)

        evidences: list[RetrievedEvidence] = []
        if not results or not results.get("documents") or not results["documents"][0]:
            return evidences

        docs = results["documents"][0]
        metas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]

        for i, text in enumerate(docs):
            meta = metas[i] if i < len(metas) else {}
            # ChromaDB cosine distance: distance = 1 - cosine_similarity
            # So similarity = max(0.0, 1.0 - distance)
            dist = distances[i] if i < len(distances) else 1.0
            score = max(0.0, min(1.0, 1.0 - float(dist)))

            evidences.append(
                RetrievedEvidence(
                    content=text,
                    source_title=meta.get("source_title", "Medical Reference"),
                    source_publisher=meta.get("source_publisher", "Clinical Source"),
                    source_url=meta.get("source_url", ""),
                    source_date=meta.get("source_date", ""),
                    relevance_score=round(score, 4),
                    chunk_id=meta.get("chunk_id", str(uuid.uuid4())),
                    section=meta.get("section", "General"),
                )
            )

        return evidences

    async def query(
        self,
        query_text: str,
        n_results: int = 5,
        where: Optional[dict[str, Any]] = None,
    ) -> list[RetrievedEvidence]:
        """Query vector store asynchronously."""
        return await asyncio.to_thread(self.query_sync, query_text, n_results, where)

    def get_all_documents_sync(self) -> list[RetrievedEvidence]:
        """Retrieve all indexed evidence chunks from the store."""
        self._ensure_initialized()
        total = self._collection.count()
        if total == 0:
            return []

        data = self._collection.get(include=["documents", "metadatas"])
        docs = data.get("documents", [])
        metas = data.get("metadatas", [])
        ids = data.get("ids", [])

        evidences: list[RetrievedEvidence] = []
        for i, text in enumerate(docs):
            meta = metas[i] if i < len(metas) else {}
            cid = ids[i] if i < len(ids) else str(uuid.uuid4())
            evidences.append(
                RetrievedEvidence(
                    content=text,
                    source_title=meta.get("source_title", "Medical Reference"),
                    source_publisher=meta.get("source_publisher", "Clinical Source"),
                    source_url=meta.get("source_url", ""),
                    source_date=meta.get("source_date", ""),
                    relevance_score=1.0,
                    chunk_id=cid,
                    section=meta.get("section", "General"),
                )
            )
        return evidences

    async def get_all_documents(self) -> list[RetrievedEvidence]:
        """Get all indexed documents asynchronously."""
        return await asyncio.to_thread(self.get_all_documents_sync)

    def clear_sync(self) -> None:
        """Clear the collection."""
        if self._client is not None:
            try:
                self._client.delete_collection(COLLECTION_NAME)
            except Exception as e:
                logger.warning(f"Error deleting collection: {e}")
            self._collection = self._client.get_or_create_collection(
                name=COLLECTION_NAME,
                metadata={"hnsw:space": "cosine"},
            )
            logger.info("Vector store collection reset.")

    async def clear(self) -> None:
        """Clear the collection asynchronously."""
        await asyncio.to_thread(self.clear_sync)


# Global singleton instance
vector_store = VectorStore()
