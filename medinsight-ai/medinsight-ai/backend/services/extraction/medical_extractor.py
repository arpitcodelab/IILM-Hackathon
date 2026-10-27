"""
MedInsight AI — Medical Data Extractor Service.
Uses Google Gemini with structured JSON output to extract clinical entities, patient demographics,
diagnoses, medications, lab tests, vital signs, allergies, procedures, and medical history.
Maintains granular traceability with source document name, page number, and evidence classification.
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any, Optional

import google.generativeai as genai

from api.models import (
    Allergy,
    ConfidenceLevel,
    Diagnosis,
    ExtractedDocument,
    InformationSource,
    LabResult,
    MedicalDate,
    Medication,
    PatientRecord,
    Procedure,
    SourceReference,
    Symptom,
    VitalSign,
)
from config import settings

logger = logging.getLogger("medinsight.medical_extractor")

SYSTEM_EXTRACTION_PROMPT = """You are an expert clinical medical intelligence system.
Your mission is to extract structured clinical data from the provided medical document text with 100% fidelity.

CRITICAL INSTRUCTIONS:
1. TRACEABILITY: Every clinical item MUST specify the source document name (`document_name`), page number (`page_number`), and verbatim source quote (`original_text`).
2. SOURCE ATTRIBUTION: Classify every item's `source_type` into one of:
   - "documented": Objective documented fact (lab report result, formal diagnosis, doctor order, discharge summary).
   - "patient_reported": Symptoms or history reported by the patient or caregiver (e.g. "patient states headache for 3 days").
   - "clinician_interpretation": Subjective clinician opinion or differential impression (e.g. "suspected viral bronchitis", "rule out ACS").
   - "uncertain": Ambiguous phrasing, illegible handwriting, or uncertain dosage (e.g. "[uncertain: Metformin ?mg]").
3. UNCERTAINTIES & ABBREVIATIONS:
   - Flag any uncertain drug names, numbers, or ambiguous units.
   - If a medication dosage or frequency is ambiguous or illegible, set `notes` explaining the uncertainty.
4. LAB RESULTS & VITALS:
   - Extract test name, value (string), unit, reference range, and flag `is_abnormal` (true/false/null).
5. MEDICATIONS:
   - Extract name, dose, frequency, route, duration, start/end date, prescriber, and status ("active" or "discontinued").
6. DIAGNOSES:
   - Extract condition name, status ("active", "resolved", "chronic", "suspected"), date, and notes.

You MUST respond strictly with valid JSON conforming to the following structure:
{
  "patient_info": {
    "name": "string or empty",
    "age": "string or empty (e.g. 45, 45y, 45 years)",
    "sex": "string or empty (e.g. Male, Female, Other)",
    "blood_group": "string or empty (e.g. B+, O-, etc.)",
    "patient_id": "string or empty (hospital MRN / UHID / ID)"
  },
  "diagnoses": [
    {
      "condition": "string",
      "icd_code": "string or null",
      "date": "string or null",
      "status": "active | resolved | chronic | suspected",
      "document_name": "string",
      "page_number": 1,
      "source_type": "documented | patient_reported | clinician_interpretation | uncertain",
      "original_text": "string verbatim quote",
      "notes": "string"
    }
  ],
  "symptoms": [
    {
      "description": "string",
      "onset": "string",
      "duration": "string",
      "severity": "string (mild | moderate | severe)",
      "date": "string or null",
      "document_name": "string",
      "page_number": 1,
      "source_type": "patient_reported | documented | clinician_interpretation",
      "original_text": "string"
    }
  ],
  "medications": [
    {
      "name": "string",
      "dose": "string",
      "frequency": "string (e.g. OD, BD, TDS, once daily)",
      "route": "string (e.g. Oral, IV, Topical)",
      "duration": "string",
      "start_date": "string or null",
      "end_date": "string or null",
      "prescriber": "string",
      "status": "active | discontinued",
      "document_name": "string",
      "page_number": 1,
      "source_type": "documented | patient_reported | uncertain",
      "original_text": "string",
      "notes": "string"
    }
  ],
  "lab_results": [
    {
      "test_name": "string",
      "value": "string",
      "unit": "string",
      "reference_range": "string",
      "is_abnormal": true | false | null,
      "date": "string or null",
      "document_name": "string",
      "page_number": 1,
      "source_type": "documented",
      "original_text": "string",
      "notes": "string"
    }
  ],
  "vital_signs": [
    {
      "name": "string (e.g. Blood Pressure, Heart Rate, SpO2, Temperature, Respiratory Rate)",
      "value": "string",
      "unit": "string",
      "is_abnormal": true | false | null,
      "date": "string or null",
      "document_name": "string",
      "page_number": 1,
      "source_type": "documented",
      "original_text": "string"
    }
  ],
  "allergies": [
    {
      "allergen": "string",
      "reaction": "string",
      "severity": "string",
      "document_name": "string",
      "page_number": 1,
      "source_type": "documented | patient_reported",
      "original_text": "string"
    }
  ],
  "procedures": [
    {
      "name": "string",
      "date": "string or null",
      "findings": "string",
      "document_name": "string",
      "page_number": 1,
      "source_type": "documented",
      "original_text": "string"
    }
  ],
  "medical_history": ["string"],
  "surgical_history": ["string"],
  "family_history": ["string"],
  "social_history": ["string (e.g. Smoker 10 pack-years, Non-alcoholic)"],
  "follow_up_recommendations": ["string"]
}
"""


class MedicalExtractor:
    """Extracts structured medical entities from document text using Gemini LLM."""

    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        self.api_key = api_key or settings.google_api_key
        self.model_name = model_name or settings.llm_model or "gemini-3.8-flash"
        self._configured = False

    def _ensure_configured(self) -> None:
        if not self._configured and self.api_key:
            genai.configure(api_key=self.api_key)
            self._configured = True

    async def extract_from_document(self, doc: ExtractedDocument) -> dict[str, Any]:
        """
        Extract structured medical entities from an ExtractedDocument.

        Args:
            doc: ExtractedDocument with text pages.

        Returns:
            Raw parsed dictionary conforming to extraction schema.
        """
        self._ensure_configured()

        if not self.api_key:
            logger.warning("Google API key not set. Skipping LLM medical extraction.")
            return self._empty_extraction_dict()

        # Build formatted multi-page text prompt
        text_payload = self._build_document_prompt(doc)
        if not text_payload.strip():
            logger.warning(f"Document {doc.filename} has empty text payload.")
            return self._empty_extraction_dict()

        try:
            model = genai.GenerativeModel(
                model_name=self.model_name,
                system_instruction=SYSTEM_EXTRACTION_PROMPT,
            )

            prompt = (
                f"Extract structured clinical data from the following document:\n\n"
                f"{text_payload}\n\n"
                f"Produce ONLY valid JSON conforming to the requested schema."
            )

            response = await model.generate_content_async(
                prompt,
                generation_config={
                    "response_mime_type": "application/json",
                    "temperature": 0.1,
                },
            )

            raw_json = response.text if response and response.text else "{}"
            parsed_data = self._clean_and_parse_json(raw_json)
            return parsed_data

        except Exception as e:
            logger.error(f"Medical extraction failed on {doc.filename}: {e}", exc_info=True)
            return self._empty_extraction_dict()

    async def extract_patient_record(self, doc: ExtractedDocument) -> PatientRecord:
        """
        Extract clinical entities from a single document and construct a typed PatientRecord.

        Args:
            doc: ExtractedDocument.

        Returns:
            PatientRecord populated with extracted data and source references.
        """
        raw_dict = await self.extract_from_document(doc)
        return self.build_patient_record_from_dict(raw_dict, default_filename=doc.filename)

    def build_patient_record_from_dict(
        self,
        data: dict[str, Any],
        default_filename: str = "",
    ) -> PatientRecord:
        """Convert a parsed extraction dictionary into typed Pydantic models."""
        p_info = data.get("patient_info", {})

        diagnoses: list[Diagnosis] = []
        for d in data.get("diagnoses", []):
            try:
                date_obj = MedicalDate(original=d.get("date") or "") if d.get("date") else None
                diagnoses.append(
                    Diagnosis(
                        condition=d.get("condition", "").strip(),
                        icd_code=d.get("icd_code"),
                        date=date_obj,
                        status=d.get("status", "active"),
                        source=self._make_source_ref(d, default_filename),
                        notes=d.get("notes", ""),
                    )
                )
            except Exception as ex:
                logger.debug(f"Skipping malformed diagnosis item: {ex}")

        symptoms: list[Symptom] = []
        for s in data.get("symptoms", []):
            try:
                date_obj = MedicalDate(original=s.get("date") or "") if s.get("date") else None
                symptoms.append(
                    Symptom(
                        description=s.get("description", "").strip(),
                        onset=s.get("onset", ""),
                        duration=s.get("duration", ""),
                        severity=s.get("severity", ""),
                        date=date_obj,
                        source=self._make_source_ref(s, default_filename),
                    )
                )
            except Exception as ex:
                logger.debug(f"Skipping malformed symptom item: {ex}")

        medications: list[Medication] = []
        for m in data.get("medications", []):
            try:
                start_d = MedicalDate(original=m.get("start_date") or "") if m.get("start_date") else None
                end_d = MedicalDate(original=m.get("end_date") or "") if m.get("end_date") else None
                medications.append(
                    Medication(
                        name=m.get("name", "").strip(),
                        dose=m.get("dose", ""),
                        frequency=m.get("frequency", ""),
                        route=m.get("route", ""),
                        duration=m.get("duration", ""),
                        start_date=start_d,
                        end_date=end_d,
                        prescriber=m.get("prescriber", ""),
                        status=m.get("status", "active"),
                        source=self._make_source_ref(m, default_filename),
                        notes=m.get("notes", ""),
                    )
                )
            except Exception as ex:
                logger.debug(f"Skipping malformed medication item: {ex}")

        lab_results: list[LabResult] = []
        for lr in data.get("lab_results", []):
            try:
                date_obj = MedicalDate(original=lr.get("date") or "") if lr.get("date") else None
                lab_results.append(
                    LabResult(
                        test_name=lr.get("test_name", "").strip(),
                        value=str(lr.get("value", "")),
                        unit=lr.get("unit", ""),
                        reference_range=lr.get("reference_range", ""),
                        is_abnormal=lr.get("is_abnormal"),
                        date=date_obj,
                        source=self._make_source_ref(lr, default_filename),
                        notes=lr.get("notes", ""),
                    )
                )
            except Exception as ex:
                logger.debug(f"Skipping malformed lab item: {ex}")

        vital_signs: list[VitalSign] = []
        for vs in data.get("vital_signs", []):
            try:
                date_obj = MedicalDate(original=vs.get("date") or "") if vs.get("date") else None
                vital_signs.append(
                    VitalSign(
                        name=vs.get("name", "").strip(),
                        value=str(vs.get("value", "")),
                        unit=vs.get("unit", ""),
                        date=date_obj,
                        is_abnormal=vs.get("is_abnormal"),
                        source=self._make_source_ref(vs, default_filename),
                    )
                )
            except Exception as ex:
                logger.debug(f"Skipping malformed vital item: {ex}")

        allergies: list[Allergy] = []
        for al in data.get("allergies", []):
            try:
                allergies.append(
                    Allergy(
                        allergen=al.get("allergen", "").strip(),
                        reaction=al.get("reaction", ""),
                        severity=al.get("severity", ""),
                        source=self._make_source_ref(al, default_filename),
                    )
                )
            except Exception as ex:
                logger.debug(f"Skipping malformed allergy item: {ex}")

        procedures: list[Procedure] = []
        for pr in data.get("procedures", []):
            try:
                date_obj = MedicalDate(original=pr.get("date") or "") if pr.get("date") else None
                procedures.append(
                    Procedure(
                        name=pr.get("name", "").strip(),
                        date=date_obj,
                        findings=pr.get("findings", ""),
                        source=self._make_source_ref(pr, default_filename),
                    )
                )
            except Exception as ex:
                logger.debug(f"Skipping malformed procedure item: {ex}")

        return PatientRecord(
            patient_id=str(p_info.get("patient_id", "") or ""),
            name=str(p_info.get("name", "") or "").strip(),
            age=str(p_info.get("age", "") or "").strip(),
            sex=str(p_info.get("sex", "") or "").strip(),
            blood_group=str(p_info.get("blood_group", "") or "").strip(),
            diagnoses=diagnoses,
            symptoms=symptoms,
            medications=medications,
            lab_results=lab_results,
            vital_signs=vital_signs,
            allergies=allergies,
            procedures=procedures,
            medical_history=data.get("medical_history", []),
            surgical_history=data.get("surgical_history", []),
            family_history=data.get("family_history", []),
            social_history=data.get("social_history", []),
            follow_up_recommendations=data.get("follow_up_recommendations", []),
            document_sources=[default_filename] if default_filename else [],
        )

    def _build_document_prompt(self, doc: ExtractedDocument) -> str:
        """Format document text with explicit document name and page boundaries."""
        chunks = []
        filename = doc.filename
        for p in doc.pages:
            if not p.text.strip():
                continue
            chunks.append(
                f"--- BEGIN DOCUMENT: '{filename}' | PAGE {p.page_number} ---\n"
                f"{p.text.strip()}\n"
                f"--- END DOCUMENT: '{filename}' | PAGE {p.page_number} ---"
            )

        if not chunks and doc.full_text.strip():
            return f"--- BEGIN DOCUMENT: '{filename}' | PAGE 1 ---\n{doc.full_text.strip()}\n--- END DOCUMENT ---"

        return "\n\n".join(chunks)

    def _make_source_ref(self, item: dict[str, Any], default_filename: str) -> SourceReference:
        """Construct a validated SourceReference model from raw item attributes."""
        source_type_str = str(item.get("source_type", "documented")).lower()

        source_type_mapping = {
            "documented": InformationSource.DOCUMENTED,
            "patient_reported": InformationSource.PATIENT_REPORTED,
            "clinician_interpretation": InformationSource.CLINICIAN_INTERPRETATION,
            "uncertain": InformationSource.UNCERTAIN,
            "ai_inferred": InformationSource.AI_INFERRED,
            "missing": InformationSource.MISSING,
        }
        st = source_type_mapping.get(source_type_str, InformationSource.DOCUMENTED)

        return SourceReference(
            document_name=item.get("document_name") or default_filename,
            page_number=int(item.get("page_number") or 1),
            source_type=st,
            ocr_confidence=ConfidenceLevel.UNKNOWN,
            original_text=item.get("original_text", ""),
        )

    def _clean_and_parse_json(self, raw_text: str) -> dict[str, Any]:
        """Strip markdown fences and parse JSON payload."""
        cleaned = raw_text.strip()
        # Remove markdown code blocks if returned
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\n", "", cleaned)
            cleaned = re.sub(r"\n```$", "", cleaned)
            cleaned = cleaned.strip()

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as err:
            logger.warning(f"Initial JSON parse failed: {err}. Attempting regex recovery.")
            # Search for outer json object
            match = re.search(r"\{[\s\S]*\}", cleaned)
            if match:
                try:
                    return json.loads(match.group(0))
                except json.JSONDecodeError:
                    pass
            logger.error("Failed to parse JSON extraction output.")
            return self._empty_extraction_dict()

    @staticmethod
    def _empty_extraction_dict() -> dict[str, Any]:
        """Return an empty extraction template matching the schema."""
        return {
            "patient_info": {},
            "diagnoses": [],
            "symptoms": [],
            "medications": [],
            "lab_results": [],
            "vital_signs": [],
            "allergies": [],
            "procedures": [],
            "medical_history": [],
            "surgical_history": [],
            "family_history": [],
            "social_history": [],
            "follow_up_recommendations": [],
        }


medical_extractor = MedicalExtractor()
