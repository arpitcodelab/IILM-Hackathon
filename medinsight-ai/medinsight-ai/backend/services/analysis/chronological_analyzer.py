"""
MedInsight AI — Stage B: Chronological Analyzer.
Builds a medical history timeline and identifies laboratory trends.
"""
import asyncio
import json
import logging
from typing import Any

from llm_client import generate_json
from api.models import PatientRecord, RetrievedEvidence, TimelineEvent, TrendObservation, SourceReference

logger = logging.getLogger("medinsight.analysis.chronological")

SYSTEM_PROMPT = """You are a clinical timeline analyst. Given a patient record, produce a structured chronological analysis in JSON.

RULES:
- Only use data explicitly present in the record.
- Trends require at least 2 documented data points with dates.
- Never invent dates, values, or interpretations.

Return JSON with this exact structure:
{
  "timeline": [
    {"date": "YYYY-MM-DD or description", "event": "event name", "category": "diagnosis|lab|medication|procedure|symptom", "details": "details", "source_document": "filename"}
  ],
  "patterns_and_trends": [
    {"parameter": "lab/vital name", "direction": "increasing|decreasing|stable|fluctuating", "values": [{"date": "date", "value": "val", "unit": "unit"}], "clinical_significance": "significance", "evidence_strength": "single_point|moderate|strong"}
  ],
  "medication_changes": ["description of medication change events"]
}"""

class ChronologicalAnalyzer:
    async def analyze(self, record: PatientRecord, evidence: list[RetrievedEvidence]) -> dict[str, Any]:
        patient_text = self._format(record)
        prompt = f"Analyze this patient record chronologically:\n\n{patient_text}"
        try:
            data = await asyncio.to_thread(generate_json, prompt, SYSTEM_PROMPT, 0.0, 2000)
            timeline = [TimelineEvent(**e) for e in data.get("timeline", []) if isinstance(e, dict)]
            trends_raw = data.get("patterns_and_trends", [])
            trends = []
            for t in trends_raw:
                if isinstance(t, dict):
                    try:
                        trends.append(TrendObservation(**t))
                    except Exception:
                        pass
            return {"timeline": timeline, "patterns_and_trends": trends, "medication_changes": data.get("medication_changes", [])}
        except Exception as e:
            logger.warning(f"ChronologicalAnalyzer error: {e}")
            return self._fallback(record)

    def _format(self, r: PatientRecord) -> str:
        lines = [f"Patient: {r.name or 'Unknown'}, Age: {r.age}, Sex: {r.sex}"]
        if r.diagnoses:
            lines.append("DIAGNOSES: " + "; ".join(f"{d.condition} [{d.status}] date:{getattr(d.date,'original','?') if d.date else '?'}" for d in r.diagnoses))
        if r.medications:
            lines.append("MEDICATIONS: " + "; ".join(f"{m.name} {m.dose} {m.frequency} status:{m.status}" for m in r.medications))
        if r.lab_results:
            lines.append("LAB RESULTS: " + "; ".join(f"{l.test_name}={l.value}{l.unit} ref:{l.reference_range} date:{getattr(l.date,'original','?') if l.date else '?'}" for l in r.lab_results))
        if r.procedures:
            lines.append("PROCEDURES: " + "; ".join(f"{p.name} date:{getattr(p.date,'original','?') if p.date else '?'}" for p in r.procedures))
        if r.symptoms:
            lines.append("SYMPTOMS: " + "; ".join(s.description for s in r.symptoms))
        return "\n".join(lines)

    def _fallback(self, r: PatientRecord) -> dict[str, Any]:
        timeline = []
        for d in r.diagnoses:
            date_str = d.date.original if d.date else "Unknown date"
            timeline.append(TimelineEvent(date=date_str, event=d.condition, category="diagnosis", details=d.notes, source_document=d.source.document_name))
        for m in r.medications:
            date_str = m.start_date.original if m.start_date else "Unknown date"
            timeline.append(TimelineEvent(date=date_str, event=f"Medication: {m.name} {m.dose}", category="medication", details=m.frequency, source_document=m.source.document_name))
        return {"timeline": timeline, "patterns_and_trends": [], "medication_changes": []}

chronological_analyzer = ChronologicalAnalyzer()
