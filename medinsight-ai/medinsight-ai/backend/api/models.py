"""
MedInsight AI — API request/response models and core data schemas.
These Pydantic models define the data contract between frontend and backend,
and between internal services.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


# ─── Enums ────────────────────────────────────────────────────────────────────

class AnalysisStatus(str, Enum):
    PENDING = "pending"
    UPLOADING = "uploading"
    EXTRACTING_TEXT = "extracting_text"
    RUNNING_OCR = "running_ocr"
    STRUCTURING_DATA = "structuring_data"
    RETRIEVING_EVIDENCE = "retrieving_evidence"
    ANALYZING = "analyzing"
    GENERATING_REPORT = "generating_report"
    COMPLETED = "completed"
    FAILED = "failed"


class FileType(str, Enum):
    PDF = "pdf"
    JPG = "jpg"
    JPEG = "jpeg"
    PNG = "png"
    TXT = "txt"


class ConfidenceLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    UNKNOWN = "unknown"


class InformationSource(str, Enum):
    DOCUMENTED = "documented"
    PATIENT_REPORTED = "patient_reported"
    CLINICIAN_INTERPRETATION = "clinician_interpretation"
    AI_INFERRED = "ai_inferred"
    UNCERTAIN = "uncertain"
    MISSING = "missing"


class RiskCategory(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    UNCERTAIN = "uncertain"


# ─── File & Upload Models ────────────────────────────────────────────────────

class FileValidationResult(BaseModel):
    filename: str
    file_type: Optional[FileType] = None
    size_bytes: int = 0
    is_valid: bool = True
    errors: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class UploadedFile(BaseModel):
    file_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    file_type: FileType
    size_bytes: int
    file_path: str = ""


# ─── OCR & Extraction Models ─────────────────────────────────────────────────

class OcrWord(BaseModel):
    text: str
    confidence: float = -1.0  # -1 means unknown
    is_uncertain: bool = False
    page: int = 0


class ExtractedPage(BaseModel):
    page_number: int
    text: str
    extraction_method: str = "digital"  # digital, ocr_printed, ocr_handwritten
    ocr_confidence: ConfidenceLevel = ConfidenceLevel.UNKNOWN
    uncertain_words: list[OcrWord] = Field(default_factory=list)
    has_images: bool = False
    has_handwriting: bool = False


class ExtractedDocument(BaseModel):
    file_id: str
    filename: str
    file_type: FileType
    total_pages: int = 0
    pages: list[ExtractedPage] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)
    extraction_warnings: list[str] = Field(default_factory=list)
    full_text: str = ""

    def get_full_text(self) -> str:
        if self.full_text:
            return self.full_text
        return "\n\n".join(p.text for p in self.pages if p.text)


# ─── Medical Data Models ─────────────────────────────────────────────────────

class SourceReference(BaseModel):
    document_name: str = ""
    page_number: int = 0
    source_type: InformationSource = InformationSource.DOCUMENTED
    ocr_confidence: ConfidenceLevel = ConfidenceLevel.UNKNOWN
    original_text: str = ""


class MedicalDate(BaseModel):
    original: str = ""
    normalized: Optional[str] = None  # ISO format YYYY-MM-DD
    is_approximate: bool = False


class Diagnosis(BaseModel):
    condition: str
    icd_code: Optional[str] = None
    date: Optional[MedicalDate] = None
    status: str = "active"  # active, resolved, chronic, suspected
    source: SourceReference = Field(default_factory=SourceReference)
    notes: str = ""


class Medication(BaseModel):
    name: str
    dose: str = ""
    frequency: str = ""
    route: str = ""
    duration: str = ""
    start_date: Optional[MedicalDate] = None
    end_date: Optional[MedicalDate] = None
    prescriber: str = ""
    status: str = "active"
    source: SourceReference = Field(default_factory=SourceReference)
    notes: str = ""


class LabResult(BaseModel):
    test_name: str
    value: str
    unit: str = ""
    reference_range: str = ""
    is_abnormal: Optional[bool] = None
    date: Optional[MedicalDate] = None
    normalized_value: Optional[float] = None
    normalized_unit: str = ""
    source: SourceReference = Field(default_factory=SourceReference)
    notes: str = ""


class VitalSign(BaseModel):
    name: str
    value: str
    unit: str = ""
    date: Optional[MedicalDate] = None
    is_abnormal: Optional[bool] = None
    source: SourceReference = Field(default_factory=SourceReference)


class Allergy(BaseModel):
    allergen: str
    reaction: str = ""
    severity: str = ""
    source: SourceReference = Field(default_factory=SourceReference)


class Symptom(BaseModel):
    description: str
    onset: str = ""
    duration: str = ""
    severity: str = ""
    date: Optional[MedicalDate] = None
    source: SourceReference = Field(default_factory=SourceReference)


class Procedure(BaseModel):
    name: str
    date: Optional[MedicalDate] = None
    findings: str = ""
    source: SourceReference = Field(default_factory=SourceReference)


class PatientRecord(BaseModel):
    """Normalized patient record assembled from multiple documents."""
    patient_id: str = ""
    name: str = ""
    age: str = ""
    sex: str = ""
    blood_group: str = ""

    diagnoses: list[Diagnosis] = Field(default_factory=list)
    symptoms: list[Symptom] = Field(default_factory=list)
    medications: list[Medication] = Field(default_factory=list)
    lab_results: list[LabResult] = Field(default_factory=list)
    vital_signs: list[VitalSign] = Field(default_factory=list)
    allergies: list[Allergy] = Field(default_factory=list)
    procedures: list[Procedure] = Field(default_factory=list)

    medical_history: list[str] = Field(default_factory=list)
    surgical_history: list[str] = Field(default_factory=list)
    family_history: list[str] = Field(default_factory=list)
    social_history: list[str] = Field(default_factory=list)

    follow_up_recommendations: list[str] = Field(default_factory=list)

    # Metadata
    document_sources: list[str] = Field(default_factory=list)
    date_range: str = ""
    conflicts: list[str] = Field(default_factory=list)
    missing_information: list[str] = Field(default_factory=list)


# ─── RAG / Evidence Models ───────────────────────────────────────────────────

class RetrievedEvidence(BaseModel):
    content: str
    source_title: str = ""
    source_publisher: str = ""
    source_url: str = ""
    source_date: str = ""
    relevance_score: float = 0.0
    chunk_id: str = ""
    section: str = ""


# ─── Report Models ───────────────────────────────────────────────────────────

class Citation(BaseModel):
    id: int = 0
    source_title: str = ""
    source_publisher: str = ""
    source_url: str = ""
    source_date: str = ""
    relevant_passage: str = ""
    page_or_section: str = ""


class TimelineEvent(BaseModel):
    date: str
    event: str
    category: str = ""  # diagnosis, lab, medication, procedure, symptom
    details: str = ""
    source_document: str = ""


class TrendObservation(BaseModel):
    parameter: str
    direction: str = ""  # increasing, decreasing, stable, fluctuating
    values: list[dict[str, str]] = Field(default_factory=list)  # [{date, value, unit}]
    clinical_significance: str = ""
    evidence_strength: str = ""
    source: SourceReference = Field(default_factory=SourceReference)


class RiskItem(BaseModel):
    risk: str
    patient_evidence: str = ""
    medical_evidence: str = ""
    risk_category: RiskCategory = RiskCategory.UNCERTAIN
    uncertainty: str = ""
    follow_up: str = ""
    citations: list[int] = Field(default_factory=list)


class TreatmentOption(BaseModel):
    treatment: str
    purpose: str = ""
    when_considered: str = ""
    contraindications: str = ""
    monitoring: str = ""
    evidence_source: str = ""
    citations: list[int] = Field(default_factory=list)


class MedicationReviewItem(BaseModel):
    medication: str
    concern: str = ""
    interaction_with: str = ""
    severity: str = ""
    evidence_source: str = ""
    recommendation: str = ""


class DocumentProcessingSummary(BaseModel):
    filename: str
    file_type: str
    pages_processed: int = 0
    extraction_method: str = ""
    ocr_confidence: str = ""
    warnings: list[str] = Field(default_factory=list)


# ─── Full Report Schema ──────────────────────────────────────────────────────

class MedicalReport(BaseModel):
    """The complete analysis report - 16 sections."""
    report_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    generated_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    analysis_id: str = ""

    # Section 1: Executive Summary
    executive_summary: str = ""

    # Section 2: Patient Record Overview
    patient_overview: dict[str, Any] = Field(default_factory=dict)

    # Section 3: Document Processing Summary
    document_processing: list[DocumentProcessingSummary] = Field(default_factory=list)

    # Section 4: Medical History Timeline
    timeline: list[TimelineEvent] = Field(default_factory=list)

    # Section 5: Existing Conditions and Findings
    existing_conditions: list[dict[str, Any]] = Field(default_factory=list)

    # Section 6: Laboratory and Diagnostic Results
    lab_results: list[dict[str, Any]] = Field(default_factory=list)

    # Section 7: Patterns and Trends
    patterns_and_trends: list[TrendObservation] = Field(default_factory=list)

    # Section 8: Potential Risks and Complications
    risks: list[RiskItem] = Field(default_factory=list)

    # Section 9: Treatment and Management Options
    treatment_options: list[TreatmentOption] = Field(default_factory=list)

    # Section 10: Medication and Allergy Review
    medication_review: list[MedicationReviewItem] = Field(default_factory=list)
    allergy_flags: list[dict[str, str]] = Field(default_factory=list)

    # Section 11: Preventive Care and Monitoring
    preventive_care: list[dict[str, str]] = Field(default_factory=list)

    # Section 12: Missing Information and Contradictions
    missing_information: list[str] = Field(default_factory=list)
    contradictions: list[str] = Field(default_factory=list)

    # Section 13: Questions for the Treating Doctor
    doctor_questions: list[str] = Field(default_factory=list)

    # Section 14: Urgent Findings and Safety Flags
    urgent_findings: list[dict[str, str]] = Field(default_factory=list)

    # Section 15: References and Evidence
    citations: list[Citation] = Field(default_factory=list)

    # Section 16: Limitations and Disclaimer
    limitations: list[str] = Field(default_factory=list)
    disclaimer: str = (
        "IMPORTANT: This report is generated by an AI system for informational and educational "
        "purposes only. It is NOT a medical diagnosis, prescription, or treatment plan. "
        "This report does NOT replace professional medical advice, diagnosis, or treatment. "
        "Always consult a qualified healthcare professional for medical decisions. "
        "The AI may make errors in text extraction, interpretation, or analysis. "
        "Verify all findings with your treating physician."
    )


# ─── API Request/Response Models ─────────────────────────────────────────────

class AnalysisStatusResponse(BaseModel):
    analysis_id: str
    status: AnalysisStatus
    stage: str = ""
    stage_detail: str = ""
    progress_pct: int = 0  # 0-100, only for real stages
    files_processed: int = 0
    total_files: int = 0
    error: Optional[str] = None
    created_at: str = ""


class AnalysisResponse(BaseModel):
    analysis_id: str
    status: AnalysisStatus
    message: str = ""


class ExtractionPreview(BaseModel):
    """Preview of extracted text for user review before analysis."""
    analysis_id: str
    documents: list[ExtractedDocument] = Field(default_factory=list)
    total_pages: int = 0
    has_uncertainties: bool = False
    uncertain_items: list[dict[str, Any]] = Field(default_factory=list)


class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str = "1.0.0"
    services: dict[str, str] = Field(default_factory=dict)


class ErrorResponse(BaseModel):
    error: str
    detail: str = ""
    status_code: int = 500
