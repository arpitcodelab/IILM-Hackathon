"""MedInsight AI — Stage D: Risk Assessor."""
import asyncio, logging
from llm_client import generate_json
from api.models import PatientRecord, RetrievedEvidence, RiskItem, RiskCategory
logger = logging.getLogger("medinsight.analysis.risk")
SYSTEM_PROMPT = """You are a clinical risk assessment specialist.
RULES: Qualitative risk categories only (low/moderate/high/uncertain). No numerical probabilities. No diagnoses. Only patient-documented evidence.
Return JSON array:
[{"risk": "risk name", "patient_evidence": "what in the record supports this", "medical_evidence": "relevant guideline reference", "risk_category": "low|moderate|high|uncertain", "uncertainty": "what is unknown", "follow_up": "suggested clinical follow-up", "citations": []}]"""

class RiskAssessor:
    async def assess_risks(self, record: PatientRecord, evidence: list[RetrievedEvidence]) -> list[RiskItem]:
        evidence_ctx = "\n".join(f"- [{e.source_title}]: {e.content[:200]}" for e in evidence[:5])
        record_ctx = f"Diagnoses: {[d.condition for d in record.diagnoses]}\nLabs(abnormal): {[(l.test_name,l.value) for l in record.lab_results if l.is_abnormal]}\nMeds: {[m.name for m in record.medications]}\nHistory: {record.medical_history[:3]}"
        prompt = f"Assess clinical risks for this patient:\n{record_ctx}\n\nEvidence:\n{evidence_ctx}"
        try:
            data = await asyncio.to_thread(generate_json, prompt, SYSTEM_PROMPT, 0.1, 2000)
            if not isinstance(data, list): data = []
            result = []
            for item in data:
                if isinstance(item, dict):
                    try:
                        cat = item.get("risk_category", "uncertain")
                        if cat not in ("low","moderate","high","uncertain"): cat = "uncertain"
                        item["risk_category"] = RiskCategory(cat)
                        result.append(RiskItem(**item))
                    except: pass
            return result
        except Exception as e:
            logger.warning(f"RiskAssessor error: {e}")
            return []

risk_assessor = RiskAssessor()
