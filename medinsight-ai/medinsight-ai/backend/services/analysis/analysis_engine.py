"""
MedInsight AI — Analysis Engine Orchestrator.
Coordinates the execution of all 7 clinical analysis stages (Stages A through G)
with concurrent execution of independent stages and strict safety verification.
"""

import asyncio
import logging
from typing import Any, Callable, Optional

from api.models import ExtractedDocument, PatientRecord, RetrievedEvidence
from services.analysis.chronological_analyzer import chronological_analyzer
from services.analysis.clinical_summarizer import clinical_summarizer
from services.analysis.evidence_verifier import evidence_verifier
from services.analysis.missing_info import missing_info_auditor
from services.analysis.pattern_identifier import pattern_identifier
from services.analysis.risk_assessor import risk_assessor
from services.analysis.treatment_info import treatment_info

logger = logging.getLogger("medinsight.analysis.engine")


class AnalysisEngine:
    """Coordinates the 7 stages of clinical analysis."""

    def __init__(self):
        pass

    async def run_analysis(
        self,
        record: PatientRecord,
        evidence: list[RetrievedEvidence],
        extracted_docs: Optional[list[ExtractedDocument]] = None,
        progress_callback: Optional[Callable[[str, int], None]] = None,
    ) -> dict[str, Any]:
        """
        Execute all 7 analysis stages sequentially or concurrently where appropriate.
        """
        logger.info(f"Starting 7-stage clinical analysis for patient: {record.patient_id or 'anonymous'}")

        def notify(msg: str, pct: int):
            if progress_callback:
                try:
                    progress_callback(msg, pct)
                except Exception as ex:
                    logger.debug(f"Progress callback exception: {ex}")

        # ─── Stage A: Clinical Summarizer ─────────────────────────────────────
        notify("Stage A: Generating executive clinical summary...", 45)
        summary = await clinical_summarizer.summarize(record, evidence)

        # ─── Stages B, C, D, E, F: Run concurrently ──────────────────────────
        notify("Stages B-F: Analyzing timeline, patterns, risks, treatments, and data gaps...", 55)

        task_b = chronological_analyzer.analyze(record, evidence)
        task_c = pattern_identifier.identify_patterns(record, evidence)
        task_d = risk_assessor.assess_risks(record, evidence)
        task_e = treatment_info.analyze_treatments(record, evidence)
        task_f = missing_info_auditor.analyze_gaps(record, extracted_docs)

        stage_b_res, stage_c_res, stage_d_res, stage_e_res, stage_f_res = await asyncio.gather(
            task_b, task_c, task_d, task_e, task_f
        )

        notify("Synthesizing longitudinal patterns and evidence...", 70)

        # Merge timeline & trends from B and C
        combined_trends = list(stage_b_res.get("patterns_and_trends", []))
        # Add distinct cross-document patterns from Stage C
        existing_params = {t.parameter.lower() for t in combined_trends}
        for pat in stage_c_res:
            if pat.parameter.lower() not in existing_params:
                combined_trends.append(pat)

        # Assemble intermediate stage outputs
        stage_outputs: dict[str, Any] = {
            "executive_summary": summary,
            "timeline": stage_b_res.get("timeline", []),
            "patterns_and_trends": combined_trends,
            "medication_changes": stage_b_res.get("medication_changes", []),
            "risks": stage_d_res,
            "treatment_options": stage_e_res.get("treatment_options", []),
            "medication_review": stage_e_res.get("medication_review", []),
            "allergy_flags": stage_e_res.get("allergy_flags", []),
            "preventive_care": stage_e_res.get("preventive_care", []),
            "missing_information": stage_f_res.get("missing_information", []),
            "contradictions": stage_f_res.get("contradictions", []),
            "urgent_findings": stage_f_res.get("urgent_findings", []),
            "doctor_questions": stage_f_res.get("doctor_questions", []),
        }

        # ─── Stage G: Evidence Verification & Quality Audit ──────────────────
        notify("Stage G: Verifying evidence, citations, and medical safety rules...", 80)
        verified_outputs = await evidence_verifier.verify(record, evidence, stage_outputs)

        logger.info("Clinical analysis pipeline completed successfully.")
        return verified_outputs


# Global singleton instance
analysis_engine = AnalysisEngine()
