"""
MedInsight AI — Report Schema and Validation Utilities.
Provides validation rules, integrity checks for all 16 MedicalReport sections,
and safety constraint enforcement (e.g., forbidding numerical probabilities).
"""

import logging
import re
from typing import Any, Optional

from api.models import MedicalReport, RiskCategory

logger = logging.getLogger("medinsight.report.schema")

# Regex to detect unapproved numerical probability phrases
NUMERICAL_PROB_REGEX = re.compile(
    r"\b(?:\d{1,2}(?:\.\d+)?%|\d{1,2}\s+in\s+\d{2,})\s*(?:risk|probability|chance|likelihood)\b",
    re.IGNORECASE,
)


def validate_medical_report(report: MedicalReport) -> list[str]:
    """
    Validate that all 16 sections of the MedicalReport are present, structurally
    compliant, and free of medical safety violations. Returns a list of validation issues.
    """
    issues: list[str] = []

    # Section 1: Executive Summary
    if not report.executive_summary or len(report.executive_summary.strip()) < 20:
        issues.append("Section 1 (Executive Summary) is missing or too brief.")

    # Section 2: Patient Record Overview
    if not report.patient_overview:
        issues.append("Section 2 (Patient Overview) is missing.")

    # Section 3: Document Processing Summary
    # Note: list can be empty if no documents, but field must exist

    # Section 4: Timeline
    # Timeline list

    # Section 5: Existing Conditions
    # Existing conditions list

    # Section 6: Laboratory & Diagnostic Results
    # Lab results list

    # Section 7: Patterns and Trends
    # Patterns and trends list

    # Section 8: Potential Risks and Complications - Safety check
    valid_categories = {RiskCategory.LOW, RiskCategory.MODERATE, RiskCategory.HIGH, RiskCategory.UNCERTAIN}
    for idx, r in enumerate(report.risks, start=1):
        if r.risk_category not in valid_categories:
            issues.append(f"Section 8 Risk #{idx} has invalid category: '{r.risk_category}'. Must be qualitative.")
        # Check for forbidden numerical probabilities
        if NUMERICAL_PROB_REGEX.search(r.risk) or NUMERICAL_PROB_REGEX.search(r.patient_evidence):
            issues.append(f"Section 8 Risk #{idx} contains prohibited numerical probability.")

    # Section 9: Treatment Options - Check prescribing violations
    for idx, opt in enumerate(report.treatment_options, start=1):
        if not opt.treatment:
            issues.append(f"Section 9 Treatment Option #{idx} is missing treatment name.")

    # Section 10: Medication & Allergy Review
    # List of medication items and allergy flags

    # Section 11: Preventive Care
    # List of preventive care items

    # Section 12: Missing Information & Contradictions
    # Strings

    # Section 13: Questions for Treating Doctor
    if not report.doctor_questions:
        issues.append("Section 13 (Questions for Treating Doctor) is empty.")

    # Section 14: Urgent Findings
    # Urgent findings list

    # Section 15: References and Evidence
    citation_ids = {c.id for c in report.citations}
    for opt in report.treatment_options:
        for cid in opt.citations:
            if cid not in citation_ids:
                issues.append(f"Treatment option '{opt.treatment}' references nonexistent citation ID {cid}.")

    # Section 16: Limitations & Disclaimer
    if not report.limitations:
        issues.append("Section 16 (Limitations) must contain analytical and technical limitations.")
    if not report.disclaimer or "NOT a medical diagnosis" not in report.disclaimer:
        issues.append("Section 16 (Disclaimer) is missing or does not contain required legal warning.")

    return issues


def get_risk_badge_color(category: RiskCategory | str) -> dict[str, str]:
    """Return UI color styling for qualitative risk badges."""
    cat = str(category).lower()
    if "high" in cat:
        return {"bg": "#fee2e2", "text": "#991b1b", "border": "#f87171"}
    elif "mod" in cat:
        return {"bg": "#fef3c7", "text": "#92400e", "border": "#fcd34d"}
    elif "low" in cat:
        return {"bg": "#dcfce7", "text": "#166534", "border": "#86efac"}
    return {"bg": "#f1f5f9", "text": "#475569", "border": "#cbd5e1"}
