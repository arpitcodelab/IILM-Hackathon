"""
MedInsight AI — Configuration module.
Reads settings from .env file and environment variables.
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings
from pydantic import Field

# Base directory is the backend folder
BASE_DIR = Path(__file__).resolve().parent


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # LLM
    google_api_key: str = Field(default="", description="Google Gemini API key")
    llm_model: str = Field(default="gemini-3.5-flash", description="LLM model name")
    embedding_model: str = Field(default="gemini-embedding-001", description="Embedding model name")

    # OCR
    tesseract_cmd: str = Field(
        default=r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        description="Path to Tesseract executable",
    )
    ocr_providers: str = Field(
        default="tesseract,gemini_vision",
        description="Comma-separated OCR providers",
    )

    # Upload
    max_file_size_mb: int = Field(default=50, description="Max file size in MB")
    max_files_per_batch: int = Field(default=20, description="Max files per batch")

    # Paths
    chroma_persist_dir: str = Field(default="./data/chromadb")
    knowledge_base_dir: str = Field(default="./knowledge_base/seed")
    upload_dir: str = Field(default="./data/uploads")
    temp_dir: str = Field(default="./data/temp")

    # Server
    backend_host: str = Field(default="0.0.0.0")
    backend_port: int = Field(default=8000)
    frontend_url: str = Field(default="http://localhost:5173")

    # Logging
    log_level: str = Field(default="INFO")

    model_config = {
        "env_file": str(BASE_DIR / ".env"),
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }

    @property
    def ocr_provider_list(self) -> list[str]:
        return [p.strip() for p in self.ocr_providers.split(",")]

    @property
    def max_file_size_bytes(self) -> int:
        return self.max_file_size_mb * 1024 * 1024

    def get_upload_path(self) -> Path:
        path = BASE_DIR / self.upload_dir
        path.mkdir(parents=True, exist_ok=True)
        return path

    def get_temp_path(self) -> Path:
        path = BASE_DIR / self.temp_dir
        path.mkdir(parents=True, exist_ok=True)
        return path

    def get_chroma_path(self) -> Path:
        path = BASE_DIR / self.chroma_persist_dir
        path.mkdir(parents=True, exist_ok=True)
        return path

    def get_knowledge_base_path(self) -> Path:
        path = BASE_DIR / self.knowledge_base_dir
        path.mkdir(parents=True, exist_ok=True)
        return path


# Load settings - look for .env in project root (parent of backend/)
_env_path = BASE_DIR.parent / ".env"
if _env_path.exists():
    os.environ.setdefault("ENV_FILE", str(_env_path))

# Override the model config env_file to look at project root
Settings.model_config["env_file"] = str(_env_path) if _env_path.exists() else str(BASE_DIR / ".env")

settings = Settings()
