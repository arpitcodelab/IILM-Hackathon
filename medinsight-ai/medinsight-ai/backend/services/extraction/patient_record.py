"""
MedInsight AI — Patient Record Assembler Service.
Merges clinical entities extracted across multiple heterogeneous medical documents into a single
unified PatientRecord. Detects patient identity discrepancies, deduplicates clinical entities,
tracks temporal progression, compiles document sources, and flags missing clinical information.
"""

from __future__ import annotations

import logging
from collections import Counter
from typing import Optional

from api.models import (
    Allergy,
    Diagnosis,
    ExtractedDocument,
    LabResult,
    Medication,
    PatientRecord,
    Procedure,
    Symptom,
    VitalSign,
)
from services.extraction.medical_extractor import medical_extractor
from services.extraction.normalizer import normalizer

logger = logging.getLogger("medinsight.patient_record")


class PatientRecordAssembler:
    """Assembles and merges multiple partial records into a comprehensive unified PatientRecord."""

    async def assemble_from_documents(
        self,
        documents: list[ExtractedDocument],
    ) -> PatientRecord:
        """
        Extract clinical data from each document and merge them into a single PatientRecord.

        Args:
            documents: List of processed ExtractedDocuments.

        Returns:
            Unified, normalized PatientRecord with conflict detection.
        """
        partial_records: list[PatientRecord] = []

        for doc in documents:
            if not doc.get_full_text().strip():
                logger.info(f"Skipping document with empty text: {doc.filename}")
                continue

            try:
                record = await medical_extractor.extract_patient_record(doc)
                normalized_record = normalizer.normalize_patient_record(record)
                partial_records.append(normalized_record)
            except Exception as e:
                logger.error(f"Failed to extract/normalize record for {doc.filename}: {e}", exc_info=True)

        if not partial_records:
            logger.warning("No clinical records extracted from provided documents.")
            return PatientRecord(
                missing_information=["No readable medical text found in uploaded documents."]
            )

        return self.merge_records(partial_records)

    def merge_records(self, records: list[PatientRecord]) -> PatientRecord:
        """
        Merge multiple PatientRecord instances into a consolidated PatientRecord.
        Identifies identity conflicts, deduplicates medical items, and computes date ranges.

        Args:
            records: List of individual document PatientRecord instances.

        Returns:
            Consolidated PatientRecord.
        """
        if not records:
            return PatientRecord()

        conflicts: list[str] = []
        missing_info: list[str] = []

        # 1. Patient Demographics & Identity Resolution
        patient_id, p_id_conflicts = self._resolve_demographic(
            [r.patient_id for r in records if r.patient_id.strip()],
            field_name="Patient ID / MRN",
        )
        conflicts.extend(p_id_conflicts)

        name, name_conflicts = self._resolve_demographic(
            [r.name for r in records if r.name.strip()],
            field_name="Patient Name",
        )
        conflicts.extend(name_conflicts)

        sex, sex_conflicts = self._resolve_demographic(
            [r.sex for r in records if r.sex.strip()],
            field_name="Biological Sex",
        )
        conflicts.extend(sex_conflicts)

        age, age_conflicts = self._resolve_demographic(
            [r.age for r in records if r.age.strip()],
            field_name="Age",
        )
        conflicts.extend(age_conflicts)

        blood_group, bg_conflicts = self._resolve_demographic(
            [r.blood_group for r in records if r.blood_group.strip()],
            field_name="Blood Group",
        )
        conflicts.extend(bg_conflicts)

        # 2. Deduplicate and Merge Clinical Sections
        all_diagnoses = self._merge_diagnoses(records)
        all_symptoms = self._merge_symptoms(records)
        all_medications, med_conflicts = self._merge_medications(records)
        conflicts.extend(med_conflicts)
        all_lab_results = self._merge_lab_results(records)
        all_vital_signs = self._merge_vital_signs(records)
        all_allergies = self._merge_allergies(records)
        all_procedures = self._merge_procedures(records)

        # 3. History Deduplication
        med_history = self._deduplicate_strings([h for r in records for h in r.medical_history])
        surg_history = self._deduplicate_strings([h for r in records for h in r.surgical_history])
        fam_history = self._deduplicate_strings([h for r in records for h in r.family_history])
        soc_history = self._deduplicate_strings([h for r in records for h in r.social_history])
        follow_up = self._deduplicate_strings([f for r in records for f in r.follow_up_recommendations])

        # 4. Sources and Date Range
        doc_sources = self._deduplicate_strings([src for r in records for src in r.document_sources])
        date_range = self._compute_date_range(
            diagnoses=all_diagnoses,
            medications=all_medications,
            labs=all_lab_results,
            vitals=all_vital_signs,
            procedures=all_procedures,
        )

        # 5. Missing Information Audit
        if not name:
            missing_info.append("Patient name is missing.")
        if not age:
            missing_info.append("Patient age is missing.")
        if not sex:
            missing_info.append("Biological sex is missing.")
        if not blood_group:
            missing_info.append("Blood group is not documented.")
        if not all_allergies:
            missing_info.append("No allergy status documented in records (unknown if allergies exist).")

        undated_diags = [d.condition for d in all_diagnoses if not d.date or not d.date.normalized]
        if undated_diags:
            missing_info.append(
                f"Diagnoses with unknown onset dates: {', '.join(undated_diags[:5])}."
            )

        meds_without_dose = [m.name for m in all_medications if not m.dose]
        if meds_without_dose:
            missing_info.append(
                f"Medications with missing dosage: {', '.join(meds_without_dose[:5])}."
            )

        # Merge pre-existing conflicts and missing information
        for r in records:
            conflicts.extend(r.conflicts)
            missing_info.extend(r.missing_information)

        final_conflicts = self._deduplicate_strings(conflicts)
        final_missing = self._deduplicate_strings(missing_info)

        return PatientRecord(
            patient_id=patient_id,
            name=name,
            age=age,
            sex=sex,
            blood_group=blood_group,
            diagnoses=all_diagnoses,
            symptoms=all_symptoms,
            medications=all_medications,
            lab_results=all_lab_results,
            vital_signs=all_vital_signs,
            allergies=all_allergies,
            procedures=all_procedures,
            medical_history=med_history,
            surgical_history=surg_history,
            family_history=fam_history,
            social_history=soc_history,
            follow_up_recommendations=follow_up,
            document_sources=doc_sources,
            date_range=date_range,
            conflicts=final_conflicts,
            missing_information=final_missing,
        )

    # ─── Demographic Identity Conflict Detection ─────────────────────────────

    def _resolve_demographic(
        self,
        values: list[str],
        field_name: str,
    ) -> tuple[str, list[str]]:
        """Identify majority demographic value and report contradictions."""
        if not values:
            return "", []

        cleaned = [v.strip() for v in values if v.strip()]
        if not cleaned:
            return "", []

        # Canonical normalization for comparison
        counts = Counter(cleaned)
        most_common_val, _ = counts.most_common(1)[0]

        conflicts: list[str] = []
        distinct_vals = set(v.lower() for v in cleaned)
        if len(distinct_vals) > 1:
            val_list_str = " vs ".join(f"'{v}'" for v in sorted(set(cleaned)))
            conflicts.append(
                f"Conflicting {field_name} detected across documents: {val_list_str}. "
                f"Assumed '{most_common_val}' based on frequency."
            )

        return most_common_val, conflicts

    # ─── Clinical Merging & Deduplication ─────────────────────────────────────

    def _merge_diagnoses(self, records: list[PatientRecord]) -> list[Diagnosis]:
        """Deduplicate diagnoses by condition name; preserve earliest onset date."""
        merged: dict[str, Diagnosis] = {}

        for r in records:
            for d in r.diagnoses:
                key = d.condition.strip().lower()
                if not key:
                    continue

                if key not in merged:
                    merged[key] = d
                else:
                    existing = merged[key]
                    # Retain ICD code if available
                    if not existing.icd_code and d.icd_code:
                        existing.icd_code = d.icd_code
                    # Retain earlier date
                    if d.date and d.date.normalized:
                        if not existing.date or not existing.date.normalized:
                            existing.date = d.date
                        elif d.date.normalized < existing.date.normalized:
                            existing.date = d.date
                    # Append notes if distinct
                    if d.notes and d.notes not in existing.notes:
                        existing.notes = f"{existing.notes}; {d.notes}".strip("; ")

        return list(merged.values())

    def _merge_medications(self, records: list[PatientRecord]) -> tuple[list[Medication], list[str]]:
        """Deduplicate medications and flag conflicting active dosages."""
        merged: dict[str, Medication] = {}
        conflicts: list[str] = []

        for r in records:
            for m in r.medications:
                key = m.name.strip().lower()
                if not key:
                    continue

                if key not in merged:
                    merged[key] = m
                else:
                    existing = merged[key]
                    # Check for conflicting doses
                    if m.dose and existing.dose and m.dose.lower() != existing.dose.lower():
                        conflicts.append(
                            f"Conflicting dosage for medication '{existing.name}': "
                            f"'{existing.dose}' vs '{m.dose}'."
                        )
                    # Adopt more complete dosage/frequency
                    if not existing.dose and m.dose:
                        existing.dose = m.dose
                    if not existing.frequency and m.frequency:
                        existing.frequency = m.frequency
                    if not existing.route and m.route:
                        existing.route = m.route
                    if m.status == "discontinued":
                        existing.status = "discontinued"
                    if m.notes and m.notes not in existing.notes:
                        existing.notes = f"{existing.notes}; {m.notes}".strip("; ")

        return list(merged.values()), conflicts

    def _merge_lab_results(self, records: list[PatientRecord]) -> list[LabResult]:
        """
        Merge lab results preserving chronological trend history.
        Exact duplicates (same test, value, date) are deduplicated.
        """
        seen: set[tuple[str, str, Optional[str]]] = set()
        merged: list[LabResult] = []

        for r in records:
            for lab in r.lab_results:
                t_name = lab.test_name.strip().lower()
                val = lab.value.strip().lower()
                d_str = lab.date.normalized if lab.date else None

                key = (t_name, val, d_str)
                if key not in seen:
                    seen.add(key)
                    merged.append(lab)

        # Sort chronologically if date is known
        merged.sort(key=lambda x: (x.date.normalized if x.date and x.date.normalized else "9999-99-99"))
        return merged

    def _merge_vital_signs(self, records: list[PatientRecord]) -> list[VitalSign]:
        """Merge vital signs across documents, preserving chronological log."""
        seen: set[tuple[str, str, Optional[str]]] = set()
        merged: list[VitalSign] = []

        for r in records:
            for v in r.vital_signs:
                v_name = v.name.strip().lower()
                val = v.value.strip().lower()
                d_str = v.date.normalized if v.date else None

                key = (v_name, val, d_str)
                if key not in seen:
                    seen.add(key)
                    merged.append(v)

        return merged

    def _merge_allergies(self, records: list[PatientRecord]) -> list[Allergy]:
        """Deduplicate allergies by allergen name; combine reaction details."""
        merged: dict[str, Allergy] = {}

        for r in records:
            for a in r.allergies:
                key = a.allergen.strip().lower()
                if not key:
                    continue

                if key not in merged:
                    merged[key] = a
                else:
                    existing = merged[key]
                    if a.reaction and a.reaction not in existing.reaction:
                        existing.reaction = f"{existing.reaction}; {a.reaction}".strip("; ")
                    if not existing.severity and a.severity:
                        existing.severity = a.severity

        return list(merged.values())

    def _merge_symptoms(self, records: list[PatientRecord]) -> list[Symptom]:
        """Deduplicate symptoms by description."""
        merged: dict[str, Symptom] = {}

        for r in records:
            for s in r.symptoms:
                key = s.description.strip().lower()
                if not key:
                    continue

                if key not in merged:
                    merged[key] = s
                else:
                    existing = merged[key]
                    if not existing.duration and s.duration:
                        existing.duration = s.duration
                    if not existing.severity and s.severity:
                        existing.severity = s.severity

        return list(merged.values())

    def _merge_procedures(self, records: list[PatientRecord]) -> list[Procedure]:
        """Deduplicate procedures by name and date."""
        seen: set[tuple[str, Optional[str]]] = set()
        merged: list[Procedure] = []

        for r in records:
            for p in r.procedures:
                key = (p.name.strip().lower(), p.date.normalized if p.date else None)
                if key not in seen:
                    seen.add(key)
                    merged.append(p)

        return merged

    def _compute_date_range(
        self,
        diagnoses: list[Diagnosis],
        medications: list[Medication],
        labs: list[LabResult],
        vitals: list[VitalSign],
        procedures: list[Procedure],
    ) -> str:
        """Find earliest and latest valid ISO dates across all clinical entries."""
        dates: list[str] = []

        for d in diagnoses:
            if d.date and d.date.normalized:
                dates.append(d.date.normalized)
        for m in medications:
            if m.start_date and m.start_date.normalized:
                dates.append(m.start_date.normalized)
            if m.end_date and m.end_date.normalized:
                dates.append(m.end_date.normalized)
        for lab in labs:
            if lab.date and lab.date.normalized:
                dates.append(lab.date.normalized)
        for v in vitals:
            if v.date and v.date.normalized:
                dates.append(v.date.normalized)
        for p in procedures:
            if p.date and p.date.normalized:
                dates.append(p.date.normalized)

        valid_dates = [d for d in dates if re.match(r"^\d{4}-\d{2}-\d{2}$", d)]
        if not valid_dates:
            return ""

        valid_dates.sort()
        earliest = valid_dates[0]
        latest = valid_dates[-1]

        if earliest == latest:
            return earliest
        return f"{earliest} to {latest}"

    @staticmethod
    def _deduplicate_strings(items: list[str]) -> list[str]:
        """Deduplicate list of strings case-insensitively while preserving insertion order."""
        seen: set[str] = set()
        unique: list[str] = []
        for item in items:
            clean = item.strip()
            if not clean:
                continue
            key = clean.lower()
            if key not in seen:
                seen.add(key)
                unique.append(clean)
        return unique


patient_record_assembler = PatientRecordAssembler()
