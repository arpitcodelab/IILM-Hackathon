"""MedInsight AI — Stage C: Pattern Identifier."""
import asyncio, json, logging
from llm_client import generate_json
from api.models import PatientRecord, RetrievedEvidence, TrendObservation, SourceReference
logger = logging.getLogger("medinsight.analysis.patterns")
SYSTEM_PROMPT = """You are a clinical pattern recognition specialist. Identify clinically meaningful patterns in the patient record.
RULES: Only patterns supported by 2+ documented findings. No invented data. Correlation != causation.
Return JSON array of patterns:
[{"parameter": "pattern name", "direction": "increasing|decreasing|stable|fluctuating|pattern", "values": [{"date": "date", "value": "finding", "unit": ""}], "clinical_significance": "significance", "evidence_strength": "moderate|strong"}]"""

class PatternIdentifier:
    async def identify_patterns(self, record: PatientRecord, evidence: list[RetrievedEvidence]) -> list[TrendObservation]:
        text = "\n".join([f"Diagnoses: {[d.condition for d in record.diagnoses]}", f"Labs: {[(l.test_name, l.value, l.unit, l.is_abnormal) for l in record.lab_results]}", f"Vitals: {[(v.name, v.value) for v in record.vital_signs]}", f"Meds: {[m.name for m in record.medications]}"])
        try:
            data = await asyncio.to_thread(generate_json, f"Find patterns in:\n{text}", SYSTEM_PROMPT, 0.1, 1500)
            if not isinstance(data, list): data = []
            result = []
            for item in data:
                if isinstance(item, dict):
                    try: result.append(TrendObservation(**item))
                    except: pass
            return result
        except Exception as e:
            logger.warning(f"PatternIdentifier error: {e}")
            return []

pattern_identifier = PatternIdentifier()
