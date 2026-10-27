"""
MedInsight AI — Normalization Service.
Normalizes heterogeneous clinical dates (including Indian and international conventions),
laboratory test units and reference ranges, vital sign measurements, and medical terminology.
"""

from __future__ import annotations

import logging
import re
from datetime import datetime
from typing import Optional, Tuple

from api.models import (
    Diagnosis,
    LabResult,
    MedicalDate,
    Medication,
    PatientRecord,
    VitalSign,
)

logger = logging.getLogger("medinsight.normalizer")

# ─── Unit Normalization Maps ──────────────────────────────────────────────────
UNIT_NORMALIZATION_MAP: dict[str, str] = {
    # Concentration
    "mg/dl": "mg/dL",
    "mg/100ml": "mg/dL",
    "mg%": "mg/dL",
    "mg / dl": "mg/dL",
    "g/dl": "g/dL",
    "gm/dl": "g/dL",
    "g%": "g/dL",
    "g / dl": "g/dL",
    "ug/dl": "μg/dL",
    "mcg/dl": "μg/dL",
    "ng/ml": "ng/mL",
    "ng / ml": "ng/mL",
    "pg/ml": "pg/mL",
    "pg / ml": "pg/mL",
    "ug/ml": "μg/mL",
    "mcg/ml": "μg/mL",
    "mmol/l": "mmol/L",
    "umol/l": "μmol/L",
    "mcmol/l": "μmol/L",
    "meq/l": "mEq/L",
    "u/l": "U/L",
    "iu/l": "IU/L",
    "u/ml": "U/mL",
    "iu/ml": "IU/mL",
    "miu/ml": "mIU/mL",
    "uiu/ml": "μIU/mL",
    "µiu/ml": "μIU/mL",
    # Hematology counts
    "cells/cumm": "cells/mcL",
    "/cumm": "cells/mcL",
    "cumm": "cells/mcL",
    "cells/cu.mm": "cells/mcL",
    "cells/mcl": "cells/mcL",
    "cells/ul": "cells/mcL",
    "/ul": "cells/mcL",
    "x10^3/ul": "10^3/μL",
    "x10^6/ul": "10^6/μL",
    "10^3/ul": "10^3/μL",
    "10^6/ul": "10^6/μL",
    "k/ul": "10^3/μL",
    "m/ul": "10^6/μL",
    # Miscellaneous
    "%": "%",
    "percent": "%",
    "percentage": "%",
    "fl": "fL",
    "pg": "pg",
    "mm/hr": "mm/hr",
    "mm/1st hr": "mm/hr",
    "mm/hr.": "mm/hr",
    "sec": "seconds",
    "secs": "seconds",
    "seconds": "seconds",
}

# ─── Medical Terminology & Acronym Mappings ──────────────────────────────────
MEDICAL_ACRONYM_MAP: dict[str, str] = {
    "htn": "Hypertension",
    "dm": "Diabetes Mellitus",
    "t2dm": "Type 2 Diabetes Mellitus",
    "dm2": "Type 2 Diabetes Mellitus",
    "t1dm": "Type 1 Diabetes Mellitus",
    "dm1": "Type 1 Diabetes Mellitus",
    "cad": "Coronary Artery Disease",
    "chf": "Congestive Heart Failure",
    "ckd": "Chronic Kidney Disease",
    "copd": "Chronic Obstructive Pulmonary Disease",
    "gerd": "Gastroesophageal Reflux Disease",
    "dvt": "Deep Vein Thrombosis",
    "pe": "Pulmonary Embolism",
    "uti": "Urinary Tract Infection",
    "urti": "Upper Respiratory Tract Infection",
    "uri": "Upper Respiratory Infection",
    "acs": "Acute Coronary Syndrome",
    "cva": "Cerebrovascular Accident",
    "tia": "Transient Ischemic Attack",
    "af": "Atrial Fibrillation",
    "afib": "Atrial Fibrillation",
    "bph": "Benign Prostatic Hyperplasia",
    "ra": "Rheumatoid Arthritis",
    "oa": "Osteoarthritis",
    "pcos": "Polycystic Ovary Syndrome",
    "ptb": "Pulmonary Tuberculosis",
    "tb": "Tuberculosis",
}

# ─── Prescription Frequency Mappings ─────────────────────────────────────────
FREQUENCY_MAP: dict[str, str] = {
    "od": "Once daily (OD)",
    "qd": "Once daily (OD)",
    "q.d.": "Once daily (OD)",
    "o.d.": "Once daily (OD)",
    "bd": "Twice daily (BD)",
    "bid": "Twice daily (BD)",
    "b.i.d.": "Twice daily (BD)",
    "b.d.": "Twice daily (BD)",
    "tds": "Three times daily (TDS)",
    "tid": "Three times daily (TDS)",
    "t.i.d.": "Three times daily (TDS)",
    "t.d.s.": "Three times daily (TDS)",
    "qid": "Four times daily (QID)",
    "q.i.d.": "Four times daily (QID)",
    "sos": "As needed (SOS)",
    "prn": "As needed (PRN)",
    "hs": "At bedtime (HS)",
    "qhs": "At bedtime (HS)",
    "stat": "Immediately (STAT)",
    "q4h": "Every 4 hours",
    "q6h": "Every 6 hours",
    "q8h": "Every 8 hours",
    "q12h": "Every 12 hours",
    "once daily": "Once daily (OD)",
    "twice daily": "Twice daily (BD)",
    "thrice daily": "Three times daily (TDS)",
    "bbf": "Before breakfast",
    "ac": "Before meals",
    "pc": "After meals",
}

# Regex prefixes for drug forms
DRUG_FORM_PREFIX_REGEX = re.compile(
    r"^(?:tab(?:let)?\.?|cap(?:sule)?\.?|syr(?:up)?\.?|inj(?:ection)?\.?|oint(?:ment)?\.?|cream\.?|drops?\.?)\s+",
    re.IGNORECASE,
)


class MedicalNormalizer:
    """Normalizes dates, units, numerical values, and medical terminology."""

    # ─── Date Normalization ───────────────────────────────────────────────────

    @classmethod
    def normalize_date(cls, date_str: Optional[str]) -> Optional[MedicalDate]:
        """
        Parse and normalize date strings into ISO YYYY-MM-DD.
        Handles Indian date formats (DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY),
        international formats (YYYY-MM-DD, Month DD, YYYY), and relative/partial dates.

        Args:
            date_str: Raw date string from clinical document.

        Returns:
            MedicalDate model with normalized ISO string and approximation flag, or None.
        """
        if not date_str or not date_str.strip():
            return None

        clean_str = date_str.strip()
        is_approx = False

        # Check for approximate keywords
        if re.search(r"\b(?:approx|about|around|since|c\.|ca\.|roughly|past)\b", clean_str, re.IGNORECASE):
            is_approx = True

        # Extract primary date portion
        # Try Indian format first: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
        indian_match = re.search(r"\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})\b", clean_str)
        if indian_match:
            d_part, m_part, y_part = (
                int(indian_match.group(1)),
                int(indian_match.group(2)),
                int(indian_match.group(3)),
            )
            # In Indian convention, day is first. If first > 12, it must be day.
            # If both <= 12, assume DD/MM/YYYY
            try:
                dt = datetime(y_part, m_part, d_part)
                return MedicalDate(
                    original=clean_str,
                    normalized=dt.strftime("%Y-%m-%d"),
                    is_approximate=is_approx,
                )
            except ValueError:
                # Might have been MM/DD/YYYY if d_part <= 12 and m_part > 12
                try:
                    dt = datetime(y_part, d_part, m_part)
                    return MedicalDate(
                        original=clean_str,
                        normalized=dt.strftime("%Y-%m-%d"),
                        is_approximate=is_approx,
                    )
                except ValueError:
                    pass

        # Try ISO format: YYYY-MM-DD or YYYY/MM/DD
        iso_match = re.search(r"\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b", clean_str)
        if iso_match:
            try:
                y, m, d = int(iso_match.group(1)), int(iso_match.group(2)), int(iso_match.group(3))
                dt = datetime(y, m, d)
                return MedicalDate(
                    original=clean_str,
                    normalized=dt.strftime("%Y-%m-%d"),
                    is_approximate=is_approx,
                )
            except ValueError:
                pass

        # Try 2-digit year format: DD/MM/YY or DD-MM-YY
        short_year_match = re.search(r"\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{2})\b", clean_str)
        if short_year_match:
            d_part, m_part, y_part = (
                int(short_year_match.group(1)),
                int(short_year_match.group(2)),
                int(short_year_match.group(3)),
            )
            full_year = 2000 + y_part if y_part < 70 else 1900 + y_part
            try:
                dt = datetime(full_year, m_part, d_part)
                return MedicalDate(
                    original=clean_str,
                    normalized=dt.strftime("%Y-%m-%d"),
                    is_approximate=is_approx,
                )
            except ValueError:
                pass

        # Try text month formats: DD-Mon-YYYY (e.g. 15-Jan-2023), 15 Jan 2023, January 15, 2023
        text_month_patterns = [
            ("%d-%b-%Y", r"\b\d{1,2}-[A-Za-z]{3,9}-\d{4}\b"),
            ("%d %b %Y", r"\b\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}\b"),
            ("%b %d, %Y", r"\b[A-Za-z]{3,9}\s+\d{1,2},\s*\d{4}\b"),
            ("%b %d %Y", r"\b[A-Za-z]{3,9}\s+\d{1,2}\s+\d{4}\b"),
            ("%d-%B-%Y", r"\b\d{1,2}-[A-Za-z]{3,9}-\d{4}\b"),
        ]

        for fmt, pat in text_month_patterns:
            m = re.search(pat, clean_str)
            if m:
                matched_token = m.group(0).replace(",", "").strip()
                try:
                    dt = datetime.strptime(matched_token, fmt.replace(",", ""))
                    return MedicalDate(
                        original=clean_str,
                        normalized=dt.strftime("%Y-%m-%d"),
                        is_approximate=is_approx,
                    )
                except ValueError:
                    continue

        # Try Year only: e.g. "2022" or "in 2020"
        year_match = re.search(r"\b(19\d{2}|20\d{2})\b", clean_str)
        if year_match:
            return MedicalDate(
                original=clean_str,
                normalized=f"{year_match.group(1)}-01-01",
                is_approximate=True,
            )

        # Unable to parse structured date; retain original
        return MedicalDate(original=clean_str, normalized=None, is_approximate=True)

    # ─── Unit Normalization ───────────────────────────────────────────────────

    @classmethod
    def normalize_unit(cls, unit_str: Optional[str]) -> str:
        """Standardize clinical laboratory unit representations."""
        if not unit_str:
            return ""
        clean = unit_str.strip().lower()
        clean = re.sub(r"\s+", "", clean)
        return UNIT_NORMALIZATION_MAP.get(clean, unit_str.strip())

    @classmethod
    def parse_numeric_value(cls, value_str: str) -> Optional[float]:
        """Extract primary floating point value from clinical string (e.g. '< 0.05', '120 mg/dl')."""
        if not value_str:
            return None
        # Remove commas from numbers like 4,500
        clean = value_str.replace(",", "")
        match = re.search(r"[-+]?\d*\.?\d+", clean)
        if match:
            try:
                return float(match.group(0))
            except ValueError:
                return None
        return None

    # ─── Reference Range & Abnormality Evaluation ─────────────────────────────

    @classmethod
    def evaluate_lab_abnormality(
        cls,
        value: float,
        ref_range_str: str,
    ) -> Optional[bool]:
        """
        Evaluate whether a numeric lab result is outside the specified reference range.

        Supports:
        - "70 - 100" (min-max range)
        - "< 140" or "<= 200" (upper bound)
        - "> 60" or ">= 90" (lower bound)
        """
        if not ref_range_str or not ref_range_str.strip():
            return None

        clean_range = ref_range_str.strip().replace(",", "")

        # Range format: min - max
        range_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)", clean_range, re.IGNORECASE)
        if range_match:
            try:
                low = float(range_match.group(1))
                high = float(range_match.group(2))
                return value < low or value > high
            except ValueError:
                pass

        # Upper bound: < max
        less_match = re.search(r"(?:<|<=|less than|up to)\s*(\d+(?:\.\d+)?)", clean_range, re.IGNORECASE)
        if less_match:
            try:
                upper = float(less_match.group(1))
                return value > upper
            except ValueError:
                pass

        # Lower bound: > min
        greater_match = re.search(r"(?:>|>=|greater than)\s*(\d+(?:\.\d+)?)", clean_range, re.IGNORECASE)
        if greater_match:
            try:
                lower = float(greater_match.group(1))
                return value < lower
            except ValueError:
                pass

        return None

    # ─── Vital Sign Normalization ─────────────────────────────────────────────

    @classmethod
    def normalize_vital_sign(cls, vital: VitalSign) -> VitalSign:
        """
        Normalize vital sign name, units, and detect clinically abnormal values.
        Evaluates BP, Heart Rate, SpO2, Temperature, and Respiratory Rate against clinical baselines.
        """
        name_lower = vital.name.lower().strip()
        val_str = vital.value.strip()

        # Blood Pressure (Systolic / Diastolic)
        if "blood pressure" in name_lower or name_lower in ("bp", "b.p."):
            vital.name = "Blood Pressure"
            vital.unit = "mmHg"
            bp_match = re.search(r"(\d{2,3})\s*/\s*(\d{2,3})", val_str)
            if bp_match:
                sys = int(bp_match.group(1))
                dia = int(bp_match.group(2))
                # Normal BP: sys < 120 and dia < 80; Elevated/Stage 1 HTN >= 130 or >= 80
                vital.is_abnormal = sys >= 130 or dia >= 80 or sys < 90 or dia < 60

        # Heart Rate / Pulse
        elif any(k in name_lower for k in ("heart rate", "pulse", "hr", "pr")):
            vital.name = "Heart Rate"
            vital.unit = "bpm"
            num_val = cls.parse_numeric_value(val_str)
            if num_val is not None:
                # Normal resting HR: 60 - 100 bpm
                vital.is_abnormal = num_val < 60 or num_val > 100

        # Oxygen Saturation (SpO2)
        elif any(k in name_lower for k in ("spo2", "saturation", "o2 sat", "pulse oximetry")):
            vital.name = "SpO2"
            vital.unit = "%"
            num_val = cls.parse_numeric_value(val_str)
            if num_val is not None:
                # Normal SpO2: 95% - 100%
                vital.is_abnormal = num_val < 95

        # Respiratory Rate
        elif any(k in name_lower for k in ("respiratory rate", "rr", "resp rate")):
            vital.name = "Respiratory Rate"
            vital.unit = "breaths/min"
            num_val = cls.parse_numeric_value(val_str)
            if num_val is not None:
                # Normal resting RR: 12 - 20 breaths/min
                vital.is_abnormal = num_val < 12 or num_val > 20

        # Body Temperature
        elif any(k in name_lower for k in ("temperature", "temp")):
            vital.name = "Temperature"
            num_val = cls.parse_numeric_value(val_str)
            if num_val is not None:
                # If value is in 95-106 range, it's Fahrenheit; if in 35-42 range, Celsius
                if num_val > 50:
                    vital.unit = "°F"
                    vital.is_abnormal = num_val > 100.4 or num_val < 96.8
                else:
                    vital.unit = "°C"
                    vital.is_abnormal = num_val > 38.0 or num_val < 36.0

        if vital.date and vital.date.original:
            vital.date = cls.normalize_date(vital.date.original)

        return vital

    # ─── Medical Terminology & Medication Normalization ───────────────────────

    @classmethod
    def normalize_diagnosis(cls, diag: Diagnosis) -> Diagnosis:
        """Standardize diagnosis condition names using medical acronym mappings."""
        cond_clean = diag.condition.strip()
        cond_lower = cond_clean.lower()

        # Check direct acronym lookup
        if cond_lower in MEDICAL_ACRONYM_MAP:
            diag.condition = MEDICAL_ACRONYM_MAP[cond_lower]
        else:
            # Capitalize condition words properly if all lowercase
            if cond_clean.islower():
                diag.condition = cond_clean.title()

        if diag.date and diag.date.original:
            diag.date = cls.normalize_date(diag.date.original)

        return diag

    @classmethod
    def normalize_medication(cls, med: Medication) -> Medication:
        """Clean drug brand/generic prefixes and standardize dosage frequency."""
        # Strip form prefix (e.g. "Tab. Paracetamol 500mg" -> "Paracetamol 500mg")
        cleaned_name = DRUG_FORM_PREFIX_REGEX.sub("", med.name.strip())

        # If dose is embedded in name (e.g. "Metformin 500 mg") and dose field is empty, split them
        if not med.dose:
            dose_match = re.search(r"(\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|iu|units?))\b", cleaned_name, re.IGNORECASE)
            if dose_match:
                med.dose = dose_match.group(1).strip()
                cleaned_name = cleaned_name[: dose_match.start()].strip()

        med.name = cleaned_name.title() if cleaned_name.islower() else cleaned_name

        # Standardize frequency
        if med.frequency:
            freq_clean = med.frequency.strip().lower()
            med.frequency = FREQUENCY_MAP.get(freq_clean, med.frequency.strip())

        # Normalize dates
        if med.start_date and med.start_date.original:
            med.start_date = cls.normalize_date(med.start_date.original)
        if med.end_date and med.end_date.original:
            med.end_date = cls.normalize_date(med.end_date.original)

        return med

    @classmethod
    def normalize_lab_result(cls, lab: LabResult) -> LabResult:
        """Normalize lab test unit, numeric value, and evaluate reference range."""
        lab.normalized_unit = cls.normalize_unit(lab.unit)
        lab.normalized_value = cls.parse_numeric_value(lab.value)

        # Evaluate abnormality if not explicitly determined and normalized value exists
        if lab.is_abnormal is None and lab.normalized_value is not None and lab.reference_range:
            lab.is_abnormal = cls.evaluate_lab_abnormality(lab.normalized_value, lab.reference_range)

        if lab.date and lab.date.original:
            lab.date = cls.normalize_date(lab.date.original)

        return lab

    # ─── Full Patient Record Normalization ────────────────────────────────────

    @classmethod
    def normalize_patient_record(cls, record: PatientRecord) -> PatientRecord:
        """
        Run complete normalization pipeline across all clinical sections of a PatientRecord.

        Args:
            record: PatientRecord to normalize.

        Returns:
            Normalized PatientRecord instance.
        """
        # 1. Diagnoses
        record.diagnoses = [cls.normalize_diagnosis(d) for d in record.diagnoses]

        # 2. Medications
        record.medications = [cls.normalize_medication(m) for m in record.medications]

        # 3. Lab Results
        record.lab_results = [cls.normalize_lab_result(lr) for lr in record.lab_results]

        # 4. Vital Signs
        record.vital_signs = [cls.normalize_vital_sign(vs) for vs in record.vital_signs]

        # 5. Symptoms dates
        for s in record.symptoms:
            if s.date and s.date.original:
                s.date = cls.normalize_date(s.date.original)

        # 6. Procedures dates
        for p in record.procedures:
            if p.date and p.date.original:
                p.date = cls.normalize_date(p.date.original)

        return record


normalizer = MedicalNormalizer()
