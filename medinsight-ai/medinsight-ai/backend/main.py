"""
MedInsight AI — FastAPI Application Entry Point.
"""

import logging
import os
import shutil
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("medinsight")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    logger.info("Starting MedInsight AI backend...")

    # Create required directories
    for dir_path in [
        settings.get_upload_path(),
        settings.get_temp_path(),
        settings.get_chroma_path(),
        settings.get_knowledge_base_path(),
    ]:
        dir_path.mkdir(parents=True, exist_ok=True)
        logger.info(f"Directory ready: {dir_path}")

    # Initialize RAG knowledge base if needed
    try:
        from services.rag.vector_store import vector_store
        await vector_store.initialize()
        from services.rag.knowledge_ingestion import knowledge_ingestion
        await knowledge_ingestion.ingest_directory()
        logger.info("Vector store initialized and knowledge base ingested")
    except Exception as e:
        logger.warning(f"Vector store initialization deferred: {e}")

    logger.info("MedInsight AI backend ready")
    yield

    # Cleanup temp files on shutdown
    temp_path = settings.get_temp_path()
    if temp_path.exists():
        shutil.rmtree(temp_path, ignore_errors=True)
    logger.info("MedInsight AI backend shut down")


app = FastAPI(
    title="MedInsight AI",
    description="RAG-based medical record analysis system",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include routes
from api.routes import router
app.include_router(router, prefix="/api")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.backend_host,
        port=settings.backend_port,
        reload=True,
    )
