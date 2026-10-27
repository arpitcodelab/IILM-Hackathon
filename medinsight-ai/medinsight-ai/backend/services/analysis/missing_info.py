"""MedInsight AI — Stage F: Missing Information Auditor."""
import asyncio, logging
from llm_client import generate_json
from api.models import PatientRecord, ExtractedDocument
logger = logging.getLogger("medinsight.analysis.missing_info")
SYSTEM_PROMPT = """You are a clinical data quality auditor.
Identify missing, ambiguous, or conflicting information that a clinician would need to properly assess this patient.
Return JSON:
{"missing_information": ["list of specific missing data items"],
 "contradictions": ["list of contradictions or conflicts between documents"],
 "urgent_findings": [{"finding": "finding", "urgency": "immediate|urgent|routine", "recommended_action": "action"}],
 "doctor_questions": ["questions the patient should ask their doctor"]}"""

class MissingInfoAuditor:
    async def analyze_gaps(self, record: PatientRecord, docs: list | None) -> dict:
        record_ctx = f"Name:{record.name} Age:{record.age} Sex:{record.sex}\nDiagnoses:{[d.condition for d in record.diagnoses]}\nMeds:{[m.name for m in record.medications]}\nAllergies:{[a.allergen for a in record.allergies]}\nLabs:{[(l.test_name,l.value,l.unit,l.is_abnormal) for l in record.lab_results]}\nVitals:{[(v.name,v.value) for v in record.vital_signs]}\nMissing flags:{record.missing_information}\nConflicts:{record.conflicts}"
        try:
            data = await asyncio.to_thread(generate_json, f"Audit gaps in:\n{record_ctx}", SYSTEM_PROMPT, 0.1, 1500)
            if not isinstance(data, dict): data = {}
            return {"missing_information": data.get("missing_information", []), "contradictions": data.get("contradictions", []), "urgent_findings": data.get("urgent_findings", []), "doctor_questions": data.get("doctor_questions", [])}
        except Exception as e:
            logger.warning(f"MissingInfoAuditor error: {e}")
            missing = list(record.missing_information)
            if not record.age: missing.append("Patient age is not documented in the medical record.")
            if not record.sex: missing.append("Patient biological sex is not recorded.")
            if not record.allergies: missing.append("No allergy status (neither confirmed allergies nor 'No Known Drug Allergies') is explicitly documented.")
            return {"missing_information": missing, "contradictions": list(record.conflicts), "urgent_findings": [], "doctor_questions": ["When should my next routine check-up, vital signs assessment, and repeat laboratory testing take place?"]}

missing_info_auditor = MissingInfoAuditor()
