# MedInsight AI — Knowledge Base Seed Directory

This directory contains verified, publicly available clinical practice guidelines, consensus statements, and laboratory reference ranges used by MedInsight AI's Retrieval-Augmented Generation (RAG) system.

## How Seed Documents Are Used
When the backend starts up, the `KnowledgeIngestionService` scans this directory:
1. Parses markdown (`.md`), plain text (`.txt`), and JSON (`.json`) files.
2. Performs **section-aware chunking** to preserve medical headings, bulleted clinical criteria, and drug/dosage considerations.
3. Generates high-dimensional vector embeddings using Google's `text-embedding-004` model.
4. Stores dense embeddings into the persistent **ChromaDB** vector store (`./data/chromadb`).
5. Updates the **BM25 lexical index** with specialized medical tokenization for hybrid retrieval.

## Adding New Knowledge Base Documents
To add new medical reference guidelines:
1. **File Format**: Place plain text (`.txt`) or markdown (`.md`) files directly into this directory.
2. **Document Structure**:
   - Use clear markdown headers (`#`, `##`, `###`) or uppercase section labels (e.g., `DIAGNOSTIC CRITERIA:`, `PHARMACOTHERAPY:`, `MONITORING:`).
   - Include standard metadata at the top of the file:
     ```text
     Title: Name of Medical Guideline
     Publisher: Medical Authority (e.g., WHO, ADA, AHA, KDIGO)
     Year: 2024
     URL: https://...
     ```
3. **Safety Guidelines**:
   - Only include peer-reviewed guidelines, clinical consensus statements, or public health publications.
   - Do not include proprietary patient records or unverified clinical opinions.
4. **Re-indexing**:
   - Restart the MedInsight AI backend, or call `knowledge_ingestion.ingest_directory(force_reindex=True)` programmatically.
