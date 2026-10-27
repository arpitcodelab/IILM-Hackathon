"""
Migration script: replaces google.generativeai usage with llm_client in all analysis/rag modules.
Run from backend directory.
"""
import re
import os
from pathlib import Path

FILES_TO_MIGRATE = [
    "services/analysis/clinical_summarizer.py",
    "services/analysis/chronological_analyzer.py",
    "services/analysis/pattern_identifier.py",
    "services/analysis/risk_assessor.py",
    "services/analysis/treatment_info.py",
    "services/analysis/missing_info.py",
    "services/analysis/evidence_verifier.py",
    "services/rag/reranker.py",
    "services/extraction/medical_extractor.py",
    "services/document_processing/ocr_engine.py",
]

def migrate(filepath: str):
    path = Path(filepath)
    if not path.exists():
        print(f"  SKIP (not found): {filepath}")
        return

    text = path.read_text(encoding="utf-8")
    original = text

    # Replace import
    text = text.replace("import google.generativeai as genai\n", "from llm_client import generate_text, generate_json\n")

    # Remove _configure methods and _model attribute (replace with pass comments)
    # Pattern: _configure method that sets up genai
    text = re.sub(
        r'    def _configure\(self\).*?(?=\n    def |\nclass |\Z)',
        '    def _configure(self) -> None:\n        pass  # Migrated to llm_client\n',
        text,
        flags=re.DOTALL
    )

    # Replace genai.configure calls
    text = re.sub(r'\s*genai\.configure\([^)]+\)\n?', '\n', text)

    # Replace GenerativeModel assignment
    text = re.sub(
        r'\s*(?:self\._model\s*=\s*)?genai\.GenerativeModel\([^)]+\)\n?',
        '\n',
        text,
        flags=re.DOTALL
    )

    if text != original:
        path.write_text(text, encoding="utf-8")
        print(f"  MIGRATED: {filepath}")
    else:
        print(f"  NO CHANGE: {filepath}")

for f in FILES_TO_MIGRATE:
    migrate(f)

print("\nDone. Manual review needed for LLM call sites.")
