"""Integration test script for MedInsight AI backend."""

import asyncio
import os
from api.models import (
    PatientRecord,
    Diagnosis,
    LabResult,
    Medication,
    VitalSign,
    Allergy,
    MedicalDate,
)
from services.rag.vector_store import vector_store
from services.rag.knowledge_ingestion import knowledge_ingestion
from services.rag.hybrid_retriever import hybrid_retriever
from services.rag.reranker import reranker
from services.analysis.analysis_engine import analysis_engine
from services.report.report_builder import report_builder
from services.report.report_schema import validate_medical_report
from services.report.pdf_exporter import pdf_exporter
from services.report.html_exporter import html_exporter
from services.batch_manager import batch_manager


async def test_full_pipeline():
    print("--- 1. Testing Vector Store & Knowledge Ingestion ---")
    await vector_store.initialize()
    ingested = await knowledge_ingestion.ingest_directory()
    print(f"Ingested chunks: {ingested}")
    total_docs = await vector_store.count()
    print(f"Total docs in vector store: {total_docs}")

    print("\n--- 2. Testing Hybrid Retrieval ---")
    results = await hybrid_retriever.retrieve("hypertension target blood pressure metformin", top_k=3)
    print(f"Retrieved {len(results)} evidence items.")
    for idx, r in enumerate(results, start=1):
        print(f"  - [{idx}] {r.source_title}: {r.content[:60]}...")

    reranked = await reranker.rerank("hypertension target blood pressure metformin", results, top_k=2)
    print(f"Reranked to {len(reranked)} items.")

    print("\n--- 3. Testing Patient Record & Analysis Engine ---")
    rec = PatientRecord(
        patient_id="PT-TEST-001",
        name="Jane Doe",
        age="58",
        sex="Female",
        blood_group="A+",
        diagnoses=[
            Diagnosis(
                condition="Type 2 Diabetes Mellitus",
                icd_code="E11.9",
                status="active",
                date=MedicalDate(original="2022-04-10"),
            ),
            Diagnosis(
                condition="Essential Hypertension",
                icd_code="I10",
                status="active",
                date=MedicalDate(original="2021-01-15"),
            ),
        ],
        medications=[
            Medication(name="Metformin", dose="1000mg", frequency="twice daily", status="active"),
            Medication(name="Lisinopril", dose="10mg", frequency="once daily", status="active"),
        ],
        lab_results=[
            LabResult(
                test_name="Hemoglobin A1c",
                value="8.4",
                unit="%",
                reference_range="4.0 - 5.6",
                is_abnormal=True,
                date=MedicalDate(original="2023-11-01"),
            ),
            LabResult(
                test_name="Serum Creatinine",
                value="1.1",
                unit="mg/dL",
                reference_range="0.5 - 1.1",
                is_abnormal=False,
                date=MedicalDate(original="2023-11-01"),
            ),
            LabResult(
                test_name="Fasting Glucose",
                value="165",
                unit="mg/dL",
                reference_range="70 - 99",
                is_abnormal=True,
                date=MedicalDate(original="2023-11-01"),
            ),
        ],
        vital_signs=[
            VitalSign(name="Blood Pressure", value="148/92", unit="mmHg", is_abnormal=True),
        ],
        allergies=[
            Allergy(allergen="Penicillin", reaction="Hives / Rash", severity="Moderate"),
        ],
        document_sources=["clinic_note_2023.txt"],
    )

    stage_outputs = await analysis_engine.run_analysis(rec, reranked)
    print("Analysis Engine stages completed successfully.")
    print("Executive Summary preview:", stage_outputs["executive_summary"][:100], "...")
    print(f"Timeline items: {len(stage_outputs['timeline'])}")
    print(f"Risks identified: {len(stage_outputs['risks'])}")
    print(f"Treatment options: {len(stage_outputs['treatment_options'])}")

    print("\n--- 4. Testing Report Builder & Validation ---")
    report = report_builder.build_report("ANL-TEST-001", rec, stage_outputs)
    issues = validate_medical_report(report)
    print(f"Report validation warnings/issues: {issues}")
    assert report.report_id.startswith("REP-")
    assert len(report.disclaimer) > 50

    print("\n--- 5. Testing PDF Export ---")
    pdf_bytes = pdf_exporter.export_pdf(report)
    print(f"Generated PDF size: {len(pdf_bytes)} bytes")
    assert len(pdf_bytes) > 1000

    print("\n--- 6. Testing HTML Export ---")
    html_text = html_exporter.export_html(report)
    print(f"Generated HTML size: {len(html_text)} chars")
    assert "<!DOCTYPE html>" in html_text
    assert "Executive Clinical Summary" in html_text

    print("\n--- 7. Testing Batch Manager Lifecycle ---")
    sample_file = (
        "test_note.txt",
        b"Patient: Jane Doe. BP: 150/95. Diagnosis: Hypertension. Rx: Lisinopril 10mg daily.",
    )
    anl_id = batch_manager.create_analysis_job([sample_file])
    print(f"Created batch job: {anl_id}")
    st = batch_manager.get_status(anl_id)
    print(f"Initial status: {st.status}")
    assert st.status.value in ["uploading", "pending"]

    print("\n==========================================")
    print(">>> ALL INTEGRATION TESTS PASSED SUCCESSFULLY! <<<")
    print("==========================================")


if __name__ == "__main__":
    asyncio.run(test_full_pipeline())
