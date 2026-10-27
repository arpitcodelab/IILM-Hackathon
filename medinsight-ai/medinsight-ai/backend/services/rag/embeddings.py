"""
MedInsight AI — Embeddings Service.
Uses google-genai SDK with gemini-embedding-001.
Falls back to deterministic hash vectors when API is unavailable.
"""

import asyncio
import hashlib
import logging
import math

from llm_client import embed_text, embed_batch

logger = logging.getLogger("medinsight.rag.embeddings")
EMBEDDING_DIM = 3072  # gemini-embedding-001 dimension


class EmbeddingService:
    """Manages embedding generation via google-genai SDK."""

    def get_embedding_sync(self, text: str, task_type: str = "retrieval_query") -> list[float]:
        return embed_text(text, task_type)

    def get_embeddings_batch_sync(self, texts: list[str], task_type: str = "retrieval_document") -> list[list[float]]:
        return embed_batch(texts, task_type)

    async def get_embedding(self, text: str, task_type: str = "retrieval_query") -> list[float]:
        return await asyncio.to_thread(self.get_embedding_sync, text, task_type)

    async def get_embeddings_batch(self, texts: list[str], task_type: str = "retrieval_document") -> list[list[float]]:
        return await asyncio.to_thread(self.get_embeddings_batch_sync, texts, task_type)


# Global singleton instance
embedding_service = EmbeddingService()
