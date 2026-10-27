"""MedInsight AI — Stage E: Treatment Information."""
import asyncio, logging
from llm_client import generate_json
from api.models import PatientRecord, RetrievedEvidence, TreatmentOption, MedicationReviewItem
logger = logging.getLogger("medinsight.analysis.treatment")
SYSTEM_PROMPT = """You are a clinical pharmacist and treatment information specialist.
RULES: General evidence-based options only. NEVER prescribe, adjust, or stop medications. Flag interactions cautiously. Cite sources.
Return JSON:
{"treatment_options": [{"treatment": "name", "purpose": "purpose", "when_considered": "when", "contraindications": "contraindications", "monitoring": "monitoring", "evidence_source": "source", "citations": []}],
 "medication_review": [{"medication": "name", "concern": "concern", "interaction_with": "other drug", "severity": "low|moderate|high|unknown", "evidence_source": "source", "recommendation": "discuss with clinician"}],
 "allergy_flags": [{"allergen": "name", "medication": "drug", "concern": "concern"}],
 "preventive_care": [{"measure": "name", "target_condition": "condition", "frequency": "frequency", "evidence_source": "source"}]}"""

class TreatmentInfoEngine:
    async def analyze_treatments(self, record: PatientRecord, evidence: list[RetrievedEvidence]) -> dict:
        evidence_ctx = "\n".join(f"[{e.source_title}]: {e.content[:250]}" for e in evidence[:5])
        record_ctx = f"Diagnoses: {[d.condition for d in record.diagnoses]}\nMeds: {[(m.name, m.dose, m.frequency) for m in record.medications]}\nAllergies: {[(a.allergen, a.reaction) for a in record.allergies]}\nAbnormal labs: {[(l.test_name, l.value, l.unit) for l in record.lab_results if l.is_abnormal]}"
        prompt = f"Provide treatment information for:\n{record_ctx}\n\nClinical Evidence:\n{evidence_ctx}"
        try:
            data = await asyncio.to_thread(generate_json, prompt, SYSTEM_PROMPT, 0.1, 3000)
            if not isinstance(data, dict): data = {}
            options = [TreatmentOption(**t) for t in data.get("treatment_options", []) if isinstance(t, dict)]
            reviews = [MedicationReviewItem(**m) for m in data.get("medication_review", []) if isinstance(m, dict)]
            return {"treatment_options": options, "medication_review": reviews, "allergy_flags": data.get("allergy_flags", []), "preventive_care": data.get("preventive_care", [])}
        except Exception as e:
            logger.warning(f"TreatmentInfoEngine error: {e}")
            return {"treatment_options": [], "medication_review": [], "allergy_flags": [], "preventive_care": [{"measure": "Comprehensive Vital Signs & Blood Pressure Surveillance", "target_condition": "Cardiovascular Health", "frequency": "At every clinical visit", "evidence_source": "Standard clinical practice"}]}

treatment_info = TreatmentInfoEngine()
