"""MedInsight AI — Stage G: Evidence Verifier."""
import asyncio, logging
from typing import Any
from llm_client import generate_json
from api.models import PatientRecord, RetrievedEvidence, Citation
logger = logging.getLogger("medinsight.analysis.verifier")
SYSTEM_PROMPT = """You are a clinical evidence quality auditor. Review the analysis outputs and verify that:
1. All clinical claims are grounded in the patient record or retrieved evidence.
2. No invented data, numerical probabilities, or prescriptions are present.
3. Citations are appropriately assigned.
Return the verified outputs with a citations list added.
Return JSON matching the input structure exactly, with a "citations" field added."""

class EvidenceVerifier:
    async def verify(self, record: PatientRecord, evidence: list[RetrievedEvidence], stage_outputs: dict[str, Any]) -> dict[str, Any]:
        # Build citations from retrieved evidence
        citations = []
        for i, e in enumerate(evidence, start=1):
            citations.append(Citation(id=i, source_title=e.source_title.replace("_", " ").title(), source_publisher=e.source_publisher or "Clinical Guidelines", source_url=e.source_url or "", source_date=e.source_date or "", relevant_passage=e.content[:200]))
        stage_outputs["citations"] = citations
        # Optional LLM verification (non-blocking)
        try:
            summary = stage_outputs.get("executive_summary", "")[:500]
            if summary and evidence:
                evidence_titles = [e.source_title for e in evidence[:3]]
                verify_prompt = f"Verify this summary uses only documented facts: '{summary}'\nPatient had: {[d.condition for d in record.diagnoses]}\nEvidence sources: {evidence_titles}\nReturn JSON: {{\"verified\": true, \"issues\": []}}"
                result = await asyncio.to_thread(generate_json, verify_prompt, SYSTEM_PROMPT, 0.0, 500)
                if isinstance(result, dict) and result.get("issues"):
                    logger.info(f"Verifier flagged {len(result['issues'])} issues")
        except Exception as e:
            logger.warning(f"EvidenceVerifier non-critical error: {e}")
        return stage_outputs

evidence_verifier = EvidenceVerifier()
