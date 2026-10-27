"""
MedInsight AI — Stage A: Clinical Summarizer.
Uses llm_client for LLM calls.
"""

import asyncio
import logging

from llm_client import generate_text
from api.models import PatientRecord, RetrievedEvidence

logger = logging.getLogger("medinsight.analysis.summarizer")

SYSTEM_PROMPT = """You are a senior clinical analyst. Produce an objective Executive Clinical Summary based strictly on the provided Patient Record and evidence.

RULES:
- NEVER invent data. Only state what is explicitly documented.
- No numerical probabilities or percentage risks.
- No prescribing or treatment mandates.
- Correlation != causation.
- Use professional, balanced clinical tone.

Format your summary with these sections:
1. Clinical Overview (age, sex, primary active conditions)
2. Key Diagnostic & Laboratory Findings (abnormal results, trends)
3. Active Medications & Therapies
4. Primary Clinical Synthesis (overall clinical status in 2-3 sentences)
"""

class ClinicalSummarizer:
    async def summarize(self, record: PatientRecord, evidence: list[RetrievedEvidence]) -> str:
        patient_ctx = self._format_patient(record)
        evidence_ctx = self._format_evidence(evidence)
        prompt = f"""Patient Record:\n{patient_ctx}\n\nRetrieved Clinical Evidence:\n{evidence_ctx}\n\nGenerate the Executive Clinical Summary:"""
        try:
            return await asyncio.to_thread(generate_text, prompt, SYSTEM_PROMPT, 0.1, 1500)
        except Exception as e:
            logger.warning(f"ClinicalSummarizer error: {e}")
            return self._fallback_summary(record)

    def _format_patient(self, r: PatientRecord) -> str:
        lines = [f"Patient: {r.name or 'De-identified'} | Age: {r.age or 'Unknown'} | Sex: {r.sex or 'Unknown'}"]
        if r.diagnoses:
            lines.append("Diagnoses: " + "; ".join(f"{d.condition} ({d.status})" for d in r.diagnoses[:8]))
        if r.medications:
            lines.append("Medications: " + "; ".join(f"{m.name} {m.dose} {m.frequency}".strip() for m in r.medications[:8]))
        if r.lab_results:
            abnormal = [l for l in r.lab_results if l.is_abnormal]
            normal = [l for l in r.lab_results if not l.is_abnormal]
            if abnormal:
                lines.append("ABNORMAL Labs: " + "; ".join(f"{l.test_name}={l.value}{l.unit}" for l in abnormal[:6]))
            if normal:
                lines.append("Normal Labs: " + "; ".join(f"{l.test_name}={l.value}{l.unit}" for l in normal[:4]))
        if r.vital_signs:
            lines.append("Vitals: " + "; ".join(f"{v.name}={v.value}{v.unit}" for v in r.vital_signs[:6]))
        if r.allergies:
            lines.append("Allergies: " + "; ".join(a.allergen for a in r.allergies))
        if r.symptoms:
            lines.append("Symptoms: " + "; ".join(s.description for s in r.symptoms[:5]))
        if r.medical_history:
            lines.append("History: " + "; ".join(r.medical_history[:4]))
        return "\n".join(lines)

    def _format_evidence(self, evidence: list[RetrievedEvidence]) -> str:
        if not evidence:
            return "No external clinical evidence retrieved."
        parts = []
        for e in evidence[:4]:
            parts.append(f"[{e.source_title}]: {e.content[:300]}")
        return "\n\n".join(parts)

    def _fallback_summary(self, r: PatientRecord) -> str:
        n_diag = len(r.diagnoses)
        n_meds = len(r.medications)
        abnormal = [l for l in r.lab_results if l.is_abnormal]
        return (
            f"This record documents a patient "
            f"(age {r.age or 'unspecified'}, sex {r.sex or 'unspecified'}) "
            f"with {n_diag} recorded condition(s) including "
            f"{', '.join(d.condition for d in r.diagnoses[:3]) or 'no active conditions recorded'}. "
            f"The patient is currently documented on {n_meds} medication(s). "
            f"{'Notable abnormal laboratory findings include: ' + ', '.join(l.test_name for l in abnormal[:3]) + '.' if abnormal else 'All findings within recorded reference ranges or insufficient data for comparison.'} "
            "Clinical review by a qualified healthcare professional is required."
        )

clinical_summarizer = ClinicalSummarizer()
