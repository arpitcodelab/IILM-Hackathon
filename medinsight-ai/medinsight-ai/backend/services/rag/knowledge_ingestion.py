"""
MedInsight AI — Knowledge Ingestion Service.
Loads medical reference documents, performs section-aware chunking,
and indexes into both ChromaDB vector store and BM25 retriever.
"""

import asyncio
import hashlib
import logging
import re
from pathlib import Path
from typing import Optional

from config import settings
from api.models import RetrievedEvidence
from services.rag.bm25_retriever import bm25_retriever
from services.rag.vector_store import vector_store

logger = logging.getLogger("medinsight.rag.ingestion")

# Regex to detect medical guideline section titles
SECTION_HEADER_PATTERN = re.compile(
    r"^(?:#{1,4}\s+|[0-9]+\.\s+|[A-Z\s]{4,}:?\s*$)(.+)$",
    re.MULTILINE,
)

TARGET_CHUNK_SIZE = 800
CHUNK_OVERLAP = 150


class KnowledgeIngestionService:
    """Handles parsing, section-aware chunking, and dual indexing of medical knowledge."""

    def __init__(self):
        pass

    def chunk_document(
        self,
        text: str,
        filename: str,
        base_metadata: Optional[dict] = None,
    ) -> list[RetrievedEvidence]:
        """
        Split a document into section-aware chunks preserving headers and context.
        """
        if not text or not text.strip():
            return []

        meta = base_metadata or {}
        source_title = meta.get("source_title") or Path(filename).stem.replace("_", " ").title()
        source_publisher = meta.get("source_publisher") or "Clinical Guidelines"
        source_url = meta.get("source_url", "")
        source_date = meta.get("source_date", "")

        # Split document by paragraphs or sections
        lines = text.splitlines()
        sections: list[tuple[str, list[str]]] = []
        current_section = "Overview"
        current_lines: list[str] = []

        for line in lines:
            line_str = line.strip()
            # Check for markdown header or uppercase section header
            is_header = False
            if line_str.startswith("#"):
                header_text = line_str.lstrip("#").strip()
                if header_text:
                    is_header = True
                    current_section = header_text
            elif len(line_str) > 3 and line_str.isupper() and not line_str.isdigit():
                is_header = True
                current_section = line_str.rstrip(":")

            if is_header and current_lines:
                sections.append((current_section, current_lines))
                current_lines = []
            else:
                if line_str:
                    current_lines.append(line_str)

        if current_lines:
            sections.append((current_section, current_lines))

        # Build chunks respecting TARGET_CHUNK_SIZE and CHUNK_OVERLAP
        chunks: list[RetrievedEvidence] = []

        for sec_name, sec_lines in sections:
            sec_text = " ".join(sec_lines)
            if len(sec_text) <= TARGET_CHUNK_SIZE:
                # Small enough to be a single chunk
                cid = hashlib.sha256(f"{filename}_{sec_name}_{sec_text[:50]}".encode()).hexdigest()[:16]
                chunks.append(
                    RetrievedEvidence(
                        content=sec_text,
                        source_title=source_title,
                        source_publisher=source_publisher,
                        source_url=source_url,
                        source_date=source_date,
                        relevance_score=1.0,
                        chunk_id=cid,
                        section=sec_name,
                    )
                )
            else:
                # Break down with overlap
                start = 0
                part_idx = 1
                while start < len(sec_text):
                    end = min(start + TARGET_CHUNK_SIZE, len(sec_text))
                    # Try to break at a sentence or word boundary
                    if end < len(sec_text):
                        boundary = sec_text.rfind(". ", start, end)
                        if boundary != -1 and boundary > start + (TARGET_CHUNK_SIZE // 2):
                            end = boundary + 1

                    chunk_str = sec_text[start:end].strip()
                    if chunk_str:
                        cid = hashlib.sha256(f"{filename}_{sec_name}_{part_idx}_{chunk_str[:50]}".encode()).hexdigest()[:16]
                        chunks.append(
                            RetrievedEvidence(
                                content=chunk_str,
                                source_title=source_title,
                                source_publisher=source_publisher,
                                source_url=source_url,
                                source_date=source_date,
                                relevance_score=1.0,
                                chunk_id=cid,
                                section=f"{sec_name} (Part {part_idx})",
                            )
                        )
                        part_idx += 1

                    start = end - CHUNK_OVERLAP
                    if start >= len(sec_text) or end == len(sec_text):
                        break

        return chunks

    def ingest_file_sync(self, file_path: Path) -> int:
        """
        Synchronously parse a file, chunk it, and add to Vector Store and BM25.
        """
        if not file_path.exists():
            logger.warning(f"File not found for ingestion: {file_path}")
            return 0

        logger.info(f"Ingesting knowledge file: {file_path.name}")
        try:
            content = file_path.read_text(encoding="utf-8", errors="replace")
        except Exception as e:
            logger.error(f"Failed to read {file_path}: {e}")
            return 0

        chunks = self.chunk_document(content, filename=file_path.name)
        if not chunks:
            return 0

        # Index in vector store
        added_count = vector_store.add_documents_sync(chunks)

        # Index/refresh in BM25
        all_docs = vector_store.get_all_documents_sync()
        bm25_retriever.index_documents(all_docs)

        logger.info(f"Ingested {added_count} chunks from {file_path.name}.")
        return added_count

    async def ingest_file(self, file_path: Path) -> int:
        """Ingest a single file asynchronously."""
        return await asyncio.to_thread(self.ingest_file_sync, file_path)

    def ingest_directory_sync(
        self,
        dir_path: Optional[Path] = None,
        force_reindex: bool = False,
    ) -> int:
        """
        Synchronously ingest all medical text and markdown files in directory.
        """
        target_dir = dir_path or settings.get_knowledge_base_path()
        if not target_dir.exists():
            logger.warning(f"Knowledge base directory does not exist: {target_dir}")
            return 0

        # If already indexed and not force_reindex, skip
        current_count = vector_store.count_sync()
        if current_count > 0 and not force_reindex:
            logger.info(f"Vector store already contains {current_count} documents. Skipping seed ingestion.")
            all_docs = vector_store.get_all_documents_sync()
            bm25_retriever.index_documents(all_docs)
            return current_count

        if force_reindex:
            vector_store.clear_sync()
            bm25_retriever.clear()

        total_chunks = 0
        extensions = [".txt", ".md", ".json"]
        files = [p for p in target_dir.glob("*") if p.is_file() and p.suffix.lower() in extensions]

        if not files:
            logger.info(f"No knowledge files found in {target_dir}")
            return 0

        all_new_chunks: list[RetrievedEvidence] = []
        for f in files:
            try:
                text = f.read_text(encoding="utf-8", errors="replace")
                chunks = self.chunk_document(text, filename=f.name)
                all_new_chunks.extend(chunks)
            except Exception as e:
                logger.error(f"Error processing {f.name}: {e}")

        if all_new_chunks:
            total_chunks = vector_store.add_documents_sync(all_new_chunks)
            bm25_retriever.index_documents(all_new_chunks)
            logger.info(f"Ingestion complete. Total indexed chunks: {total_chunks}")

        return total_chunks

    async def ingest_directory(
        self,
        dir_path: Optional[Path] = None,
        force_reindex: bool = False,
    ) -> int:
        """Ingest directory asynchronously."""
        return await asyncio.to_thread(self.ingest_directory_sync, dir_path, force_reindex)


# Global singleton instance
knowledge_ingestion = KnowledgeIngestionService()
