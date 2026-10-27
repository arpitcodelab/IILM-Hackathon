"""Quick import check for all modules."""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

errors = []

def check(name, import_fn):
    try:
        import_fn()
        print(f"  OK: {name}")
    except Exception as e:
        errors.append(name)
        print(f"  FAIL: {name} -> {e}")

print("=== Checking config ===")
check("config", lambda: __import__("config"))

print("\n=== Checking api.models ===")
check("api.models", lambda: __import__("api.models"))

print("\n=== Checking services ===")
check("file_validator", lambda: __import__("services.file_validator"))
check("batch_manager", lambda: __import__("services.batch_manager"))

print("\n=== Checking document_processing ===")
check("pdf_extractor", lambda: __import__("services.document_processing.pdf_extractor"))
check("image_processor", lambda: __import__("services.document_processing.image_processor"))
check("txt_loader", lambda: __import__("services.document_processing.txt_loader"))
check("ocr_engine", lambda: __import__("services.document_processing.ocr_engine"))
check("processor", lambda: __import__("services.document_processing.processor"))

print("\n=== Checking extraction ===")
check("medical_extractor", lambda: __import__("services.extraction.medical_extractor"))
check("normalizer", lambda: __import__("services.extraction.normalizer"))
check("patient_record", lambda: __import__("services.extraction.patient_record"))

print("\n=== Checking rag ===")
check("embeddings", lambda: __import__("services.rag.embeddings"))
check("vector_store", lambda: __import__("services.rag.vector_store"))
check("bm25_retriever", lambda: __import__("services.rag.bm25_retriever"))
check("hybrid_retriever", lambda: __import__("services.rag.hybrid_retriever"))
check("reranker", lambda: __import__("services.rag.reranker"))
check("knowledge_ingestion", lambda: __import__("services.rag.knowledge_ingestion"))

print("\n=== Checking analysis ===")
check("clinical_summarizer", lambda: __import__("services.analysis.clinical_summarizer"))
check("chronological_analyzer", lambda: __import__("services.analysis.chronological_analyzer"))
check("pattern_identifier", lambda: __import__("services.analysis.pattern_identifier"))
check("risk_assessor", lambda: __import__("services.analysis.risk_assessor"))
check("treatment_info", lambda: __import__("services.analysis.treatment_info"))
check("missing_info", lambda: __import__("services.analysis.missing_info"))
check("evidence_verifier", lambda: __import__("services.analysis.evidence_verifier"))
check("analysis_engine", lambda: __import__("services.analysis.analysis_engine"))

print("\n=== Checking report ===")
check("report_schema", lambda: __import__("services.report.report_schema"))
check("report_builder", lambda: __import__("services.report.report_builder"))
check("pdf_exporter", lambda: __import__("services.report.pdf_exporter"))
check("html_exporter", lambda: __import__("services.report.html_exporter"))

print("\n=== Checking api.routes ===")
check("api.routes", lambda: __import__("api.routes"))

print(f"\n{'='*40}")
if errors:
    print(f"FAILED: {len(errors)} modules")
    for e in errors:
        print(f"  - {e}")
else:
    print("ALL IMPORTS OK!")
