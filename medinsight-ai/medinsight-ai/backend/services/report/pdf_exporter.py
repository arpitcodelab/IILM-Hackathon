"""
MedInsight AI — PDF Report Exporter.
Generates a comprehensive, beautifully formatted medical analysis PDF report
using ReportLab, with all 16 sections, tables, citations, and required disclaimers.
"""

import io
import logging
from typing import Any, Optional

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from api.models import MedicalReport

logger = logging.getLogger("medinsight.report.pdf")


class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute and print total page count ('Page X of Y')."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, total_pages: int):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Header (pages after page 1)
        if self._pageNumber > 1:
            self.drawString(54, letter[1] - 36, "MedInsight AI — Clinical Record Analysis Report")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, letter[1] - 42, letter[0] - 54, letter[1] - 42)

        # Footer (all pages)
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 45, letter[0] - 54, 45)

        footer_text = "CONFIDENTIAL MEDICAL RECORD ANALYSIS • FOR INFORMATIONAL USE ONLY"
        self.drawString(54, 32, footer_text)

        page_str = f"Page {self._pageNumber} of {total_pages}"
        self.drawRightString(letter[0] - 54, 32, page_str)
        self.restoreState()


class PdfExporter:
    """Generates a complete multi-page PDF for a MedicalReport."""

    def __init__(self):
        pass

    def _init_styles(self) -> dict[str, ParagraphStyle]:
        styles = getSampleStyleSheet()

        custom_styles = {
            "DocTitle": ParagraphStyle(
                "DocTitle",
                parent=styles["Heading1"],
                fontName="Helvetica-Bold",
                fontSize=20,
                leading=24,
                textColor=colors.HexColor("#0f172a"),
            ),
            "SectionHeader": ParagraphStyle(
                "SectionHeader",
                parent=styles["Heading2"],
                fontName="Helvetica-Bold",
                fontSize=13,
                leading=17,
                textColor=colors.HexColor("#1e3a8a"),
                spaceBefore=14,
                spaceAfter=6,
                keepWithNext=True,
            ),
            "SubHeader": ParagraphStyle(
                "SubHeader",
                parent=styles["Heading3"],
                fontName="Helvetica-Bold",
                fontSize=10,
                leading=13,
                textColor=colors.HexColor("#0284c7"),
                spaceBefore=6,
                spaceAfter=3,
                keepWithNext=True,
            ),
            "Body": ParagraphStyle(
                "CustomBody",
                parent=styles["Normal"],
                fontName="Helvetica",
                fontSize=9,
                leading=13,
                textColor=colors.HexColor("#1e293b"),
            ),
            "BodyBold": ParagraphStyle(
                "CustomBodyBold",
                parent=styles["Normal"],
                fontName="Helvetica-Bold",
                fontSize=9,
                leading=13,
                textColor=colors.HexColor("#0f172a"),
            ),
            "MetaText": ParagraphStyle(
                "MetaText",
                parent=styles["Normal"],
                fontName="Helvetica",
                fontSize=8,
                leading=11,
                textColor=colors.HexColor("#64748b"),
            ),
            "DisclaimerText": ParagraphStyle(
                "DisclaimerText",
                parent=styles["Normal"],
                fontName="Helvetica-Oblique",
                fontSize=8,
                leading=11,
                textColor=colors.HexColor("#7f1d1d"),
            ),
            "TableHeader": ParagraphStyle(
                "TableHeader",
                parent=styles["Normal"],
                fontName="Helvetica-Bold",
                fontSize=8.5,
                leading=11,
                textColor=colors.white,
            ),
            "TableCell": ParagraphStyle(
                "TableCell",
                parent=styles["Normal"],
                fontName="Helvetica",
                fontSize=8,
                leading=11,
                textColor=colors.HexColor("#1e293b"),
            ),
            "TableCellAbnormal": ParagraphStyle(
                "TableCellAbnormal",
                parent=styles["Normal"],
                fontName="Helvetica-Bold",
                fontSize=8,
                leading=11,
                textColor=colors.HexColor("#b91c1c"),
            ),
        }
        return custom_styles

    def export_pdf(self, report: MedicalReport) -> bytes:
        """Render MedicalReport to PDF bytes."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            leftMargin=54,
            rightMargin=54,
            topMargin=54,
            bottomMargin=54,
        )

        styles = self._init_styles()
        story = []
        content_width = letter[0] - 108

        # Header Title Banner
        story.append(Paragraph("MedInsight AI — Medical Record Analysis", styles["DocTitle"]))
        meta_line = f"Report ID: {report.report_id}  |  Generated: {report.generated_at[:16].replace('T', ' ')}"
        story.append(Paragraph(meta_line, styles["MetaText"]))
        story.append(Spacer(1, 8))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1e3a8a"), spaceAfter=10))

        # Top Disclaimer Callout Box
        disclaimer_table = Table(
            [[Paragraph(f"<b>CLINICAL DISCLAIMER:</b> {report.disclaimer}", styles["DisclaimerText"])]],
            colWidths=[content_width],
        )
        disclaimer_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#fef2f2")),
                ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#f87171")),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ])
        )
        story.append(disclaimer_table)
        story.append(Spacer(1, 10))

        # ─── Section 1: Executive Summary ─────────────────────────────────────
        story.append(Paragraph("1. Executive Clinical Summary", styles["SectionHeader"]))
        summary_lines = report.executive_summary.split("\n\n") if report.executive_summary else ["No clinical summary recorded."]
        for line in summary_lines:
            if line.strip():
                story.append(Paragraph(line.strip().replace("\n", " "), styles["Body"]))
                story.append(Spacer(1, 4))
        story.append(Spacer(1, 6))

        # ─── Section 2: Patient Record Overview ───────────────────────────────
        story.append(Paragraph("2. Patient Overview", styles["SectionHeader"]))
        ov = report.patient_overview
        overview_data = [
            [
                Paragraph("<b>Patient ID:</b> " + str(ov.get("patient_id", "N/A")), styles["TableCell"]),
                Paragraph("<b>Age:</b> " + str(ov.get("age", "N/A")), styles["TableCell"]),
                Paragraph("<b>Sex:</b> " + str(ov.get("sex", "N/A")), styles["TableCell"]),
            ],
            [
                Paragraph("<b>Blood Group:</b> " + str(ov.get("blood_group", "N/A")), styles["TableCell"]),
                Paragraph("<b>Active Conditions:</b> " + str(ov.get("total_diagnoses", 0)), styles["TableCell"]),
                Paragraph("<b>Medications:</b> " + str(ov.get("active_medications", 0)), styles["TableCell"]),
            ],
            [
                Paragraph("<b>Abnormal Labs:</b> " + str(ov.get("abnormal_labs_count", 0)), styles["TableCell"]),
                Paragraph("<b>Allergies:</b> " + str(ov.get("documented_allergies_count", 0)), styles["TableCell"]),
                Paragraph("<b>Date Range:</b> " + str(ov.get("date_range", "N/A")), styles["TableCell"]),
            ],
        ]
        col_w = content_width / 3.0
        ov_table = Table(overview_data, colWidths=[col_w, col_w, col_w])
        ov_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ])
        )
        story.append(ov_table)
        story.append(Spacer(1, 10))

        # ─── Section 3: Document Processing Summary ───────────────────────────
        if report.document_processing:
            story.append(Paragraph("3. Document Processing Summary", styles["SectionHeader"]))
            doc_rows = [[
                Paragraph("Filename", styles["TableHeader"]),
                Paragraph("Type", styles["TableHeader"]),
                Paragraph("Pages", styles["TableHeader"]),
                Paragraph("Extraction Method", styles["TableHeader"]),
                Paragraph("OCR Quality", styles["TableHeader"]),
            ]]
            for d in report.document_processing:
                doc_rows.append([
                    Paragraph(d.filename, styles["TableCell"]),
                    Paragraph(d.file_type.upper(), styles["TableCell"]),
                    Paragraph(str(d.pages_processed), styles["TableCell"]),
                    Paragraph(d.extraction_method, styles["TableCell"]),
                    Paragraph(d.ocr_confidence, styles["TableCell"]),
                ])
            col_widths_doc = [content_width * 0.35, content_width * 0.12, content_width * 0.12, content_width * 0.23, content_width * 0.18]
            d_table = Table(doc_rows, colWidths=col_widths_doc)
            d_table.setStyle(
                TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a8a")),
                    ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                    ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ])
            )
            story.append(d_table)
            story.append(Spacer(1, 10))

        # ─── Section 4: Medical History Timeline ──────────────────────────────
        if report.timeline:
            story.append(Paragraph("4. Medical History Timeline", styles["SectionHeader"]))
            tl_rows = [[
                Paragraph("Date", styles["TableHeader"]),
                Paragraph("Category", styles["TableHeader"]),
                Paragraph("Event", styles["TableHeader"]),
                Paragraph("Details & Context", styles["TableHeader"]),
            ]]
            for ev in report.timeline:
                tl_rows.append([
                    Paragraph(ev.date, styles["TableCell"]),
                    Paragraph(ev.category.capitalize(), styles["TableCell"]),
                    Paragraph(ev.event, styles["TableCell"]),
                    Paragraph(ev.details, styles["TableCell"]),
                ])
            tl_table = Table(tl_rows, colWidths=[content_width * 0.18, content_width * 0.16, content_width * 0.33, content_width * 0.33])
            tl_table.setStyle(
                TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a8a")),
                    ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                    ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ])
            )
            story.append(tl_table)
            story.append(Spacer(1, 10))

        # ─── Section 5: Existing Conditions ───────────────────────────────────
        if report.existing_conditions:
            story.append(Paragraph("5. Existing Conditions & Diagnoses", styles["SectionHeader"]))
            cond_rows = [[
                Paragraph("Condition", styles["TableHeader"]),
                Paragraph("Status", styles["TableHeader"]),
                Paragraph("Documented Date", styles["TableHeader"]),
                Paragraph("Notes", styles["TableHeader"]),
            ]]
            for c in report.existing_conditions:
                cond_rows.append([
                    Paragraph(c.get("condition", ""), styles["TableCell"]),
                    Paragraph(c.get("status", "active"), styles["TableCell"]),
                    Paragraph(str(c.get("date", "N/A")), styles["TableCell"]),
                    Paragraph(c.get("notes", ""), styles["TableCell"]),
                ])
            cond_table = Table(cond_rows, colWidths=[content_width * 0.35, content_width * 0.15, content_width * 0.20, content_width * 0.30])
            cond_table.setStyle(
                TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a8a")),
                    ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                    ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ])
            )
            story.append(cond_table)
            story.append(Spacer(1, 10))

        # ─── Section 6: Laboratory & Diagnostic Results ───────────────────────
        if report.lab_results:
            story.append(Paragraph("6. Laboratory & Diagnostic Results", styles["SectionHeader"]))
            lab_rows = [[
                Paragraph("Test Name", styles["TableHeader"]),
                Paragraph("Observed Value", styles["TableHeader"]),
                Paragraph("Reference Range", styles["TableHeader"]),
                Paragraph("Flag", styles["TableHeader"]),
                Paragraph("Date", styles["TableHeader"]),
            ]]
            for l in report.lab_results:
                is_ab = l.get("is_abnormal", False)
                val_style = styles["TableCellAbnormal"] if is_ab else styles["TableCell"]
                flag_text = "<b>ABNORMAL</b>" if is_ab else "Normal"
                lab_rows.append([
                    Paragraph(l.get("test_name", ""), styles["TableCell"]),
                    Paragraph(f"{l.get('value', '')} {l.get('unit', '')}".strip(), val_style),
                    Paragraph(l.get("reference_range", "N/A"), styles["TableCell"]),
                    Paragraph(flag_text, val_style),
                    Paragraph(str(l.get("date", "N/A")), styles["TableCell"]),
                ])
            lab_table = Table(lab_rows, colWidths=[content_width * 0.32, content_width * 0.22, content_width * 0.20, content_width * 0.14, content_width * 0.12])
            lab_table.setStyle(
                TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a8a")),
                    ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                    ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ])
            )
            story.append(lab_table)
            story.append(Spacer(1, 10))

        # ─── Section 7: Patterns and Trends ───────────────────────────────────
        if report.patterns_and_trends:
            story.append(Paragraph("7. Patterns and Longitudinal Trends", styles["SectionHeader"]))
            for tr in report.patterns_and_trends:
                story.append(Paragraph(f"• <b>{tr.parameter}</b> (Direction: {tr.direction}, Evidence: {tr.evidence_strength})", styles["BodyBold"]))
                story.append(Paragraph(tr.clinical_significance, styles["Body"]))
                story.append(Spacer(1, 4))
            story.append(Spacer(1, 6))

        # ─── Section 8: Potential Risks & Complications ───────────────────────
        if report.risks:
            story.append(Paragraph("8. Potential Clinical Risks and Complications", styles["SectionHeader"]))
            risk_rows = [[
                Paragraph("Risk Description", styles["TableHeader"]),
                Paragraph("Category", styles["TableHeader"]),
                Paragraph("Documented Evidence", styles["TableHeader"]),
                Paragraph("Recommended Follow-Up", styles["TableHeader"]),
            ]]
            for r in report.risks:
                cat_val = str(r.risk_category.value if hasattr(r.risk_category, "value") else r.risk_category).upper()
                risk_rows.append([
                    Paragraph(r.risk, styles["TableCell"]),
                    Paragraph(f"<b>{cat_val}</b>", styles["TableCell"]),
                    Paragraph(r.patient_evidence, styles["TableCell"]),
                    Paragraph(r.follow_up, styles["TableCell"]),
                ])
            risk_table = Table(risk_rows, colWidths=[content_width * 0.28, content_width * 0.15, content_width * 0.28, content_width * 0.29])
            risk_table.setStyle(
                TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a8a")),
                    ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                    ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ])
            )
            story.append(risk_table)
            story.append(Spacer(1, 10))

        # ─── Section 9: Treatment and Management Options ──────────────────────
        if report.treatment_options:
            story.append(Paragraph("9. Evidence-Based Treatment & Management Options", styles["SectionHeader"]))
            tx_rows = [[
                Paragraph("Treatment / Strategy", styles["TableHeader"]),
                Paragraph("Guideline Purpose", styles["TableHeader"]),
                Paragraph("Monitoring & Surveillance", styles["TableHeader"]),
                Paragraph("Reference", styles["TableHeader"]),
            ]]
            for opt in report.treatment_options:
                cites = f" [Ref: {', '.join(str(c) for c in opt.citations)}]" if opt.citations else ""
                tx_rows.append([
                    Paragraph(opt.treatment, styles["TableCell"]),
                    Paragraph(opt.purpose, styles["TableCell"]),
                    Paragraph(opt.monitoring, styles["TableCell"]),
                    Paragraph(f"{opt.evidence_source}{cites}", styles["TableCell"]),
                ])
            tx_table = Table(tx_rows, colWidths=[content_width * 0.28, content_width * 0.28, content_width * 0.24, content_width * 0.20])
            tx_table.setStyle(
                TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a8a")),
                    ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                    ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ])
            )
            story.append(tx_table)
            story.append(Spacer(1, 10))

        # ─── Section 10: Medication & Allergy Review ──────────────────────────
        story.append(Paragraph("10. Medication and Allergy Review", styles["SectionHeader"]))
        if report.allergy_flags:
            story.append(Paragraph("<b>Allergy Alerts:</b>", styles["SubHeader"]))
            for a in report.allergy_flags:
                story.append(Paragraph(f"• <b>ALERT:</b> {a.get('allergen')}: {a.get('risk_note')}", styles["TableCellAbnormal"]))
            story.append(Spacer(1, 4))

        if report.medication_review:
            med_rows = [[
                Paragraph("Medication", styles["TableHeader"]),
                Paragraph("Clinical Concern / Context", styles["TableHeader"]),
                Paragraph("Recommendation for Doctor", styles["TableHeader"]),
            ]]
            for m in report.medication_review:
                med_rows.append([
                    Paragraph(m.medication, styles["TableCell"]),
                    Paragraph(m.concern, styles["TableCell"]),
                    Paragraph(m.recommendation, styles["TableCell"]),
                ])
            med_table = Table(med_rows, colWidths=[content_width * 0.25, content_width * 0.38, content_width * 0.37])
            med_table.setStyle(
                TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a8a")),
                    ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                    ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ])
            )
            story.append(med_table)
            story.append(Spacer(1, 10))

        # ─── Section 11: Preventive Care and Monitoring ───────────────────────
        if report.preventive_care:
            story.append(Paragraph("11. Preventive Care and Surveillance", styles["SectionHeader"]))
            for p in report.preventive_care:
                story.append(Paragraph(f"• <b>{p.get('measure', '')}</b> ({p.get('frequency', '')}) — {p.get('rational', '')}", styles["Body"]))
                story.append(Spacer(1, 3))
            story.append(Spacer(1, 6))

        # ─── Section 12: Missing Information & Contradictions ─────────────────
        story.append(Paragraph("12. Missing Clinical Data and Record Discrepancies", styles["SectionHeader"]))
        if report.missing_information:
            story.append(Paragraph("<b>Missing Information:</b>", styles["SubHeader"]))
            for m in report.missing_information:
                story.append(Paragraph(f"• {m}", styles["Body"]))
            story.append(Spacer(1, 4))
        if report.contradictions:
            story.append(Paragraph("<b>Contradictions & Ambiguities:</b>", styles["SubHeader"]))
            for c in report.contradictions:
                story.append(Paragraph(f"• {c}", styles["Body"]))
            story.append(Spacer(1, 4))
        story.append(Spacer(1, 6))

        # ─── Section 13: Questions for Treating Doctor ────────────────────────
        if report.doctor_questions:
            story.append(Paragraph("13. Recommended Questions for Treating Clinician", styles["SectionHeader"]))
            for idx, q in enumerate(report.doctor_questions, start=1):
                story.append(Paragraph(f"<b>{idx}.</b> {q}", styles["Body"]))
                story.append(Spacer(1, 4))
            story.append(Spacer(1, 6))

        # ─── Section 14: Urgent Findings and Safety Flags ─────────────────────
        if report.urgent_findings:
            story.append(Paragraph("14. Urgent Findings & Priority Clinical Flags", styles["SectionHeader"]))
            for u in report.urgent_findings:
                story.append(Paragraph(f"• <b>PRIORITY [{u.get('severity', 'ATTENTION').upper()}]:</b> {u.get('finding')} — {u.get('recommended_action')}", styles["TableCellAbnormal"]))
                story.append(Spacer(1, 3))
            story.append(Spacer(1, 6))

        # ─── Section 15: References and Evidence ──────────────────────────────
        if report.citations:
            story.append(Paragraph("15. References and Clinical Evidence", styles["SectionHeader"]))
            for c in report.citations:
                story.append(Paragraph(f"<b>[{c.id}] {c.source_title}</b> ({c.source_publisher}, {c.page_or_section})", styles["BodyBold"]))
                story.append(Paragraph(f'"{c.relevant_passage}"', styles["MetaText"]))
                story.append(Spacer(1, 4))
            story.append(Spacer(1, 6))

        # ─── Section 16: Limitations and Disclaimer ───────────────────────────
        story.append(Paragraph("16. Analytical Limitations & Medical Disclaimer", styles["SectionHeader"]))
        for lim in report.limitations:
            story.append(Paragraph(f"• {lim}", styles["MetaText"]))
            story.append(Spacer(1, 2))
        story.append(Spacer(1, 6))

        # Bottom Full Disclaimer Box
        full_disc = Table(
            [[Paragraph(f"<b>LEGAL & CLINICAL DISCLAIMER:</b> {report.disclaimer}", styles["DisclaimerText"])]],
            colWidths=[content_width],
        )
        full_disc.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#fff1f2")),
                ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#e11d48")),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ])
        )
        story.append(full_disc)

        # Build document with NumberedCanvas
        doc.build(story, canvasmaker=NumberedCanvas)
        pdf_bytes = buffer.getvalue()
        buffer.close()

        logger.info(f"Generated PDF report for {report.report_id} ({len(pdf_bytes)} bytes).")
        return pdf_bytes


# Global singleton instance
pdf_exporter = PdfExporter()
