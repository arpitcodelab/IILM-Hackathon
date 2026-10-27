"""
MedInsight AI — HTML Report Exporter.
Renders the complete 16-section MedicalReport into a modern, responsive,
clinically styled standalone HTML document.
"""

import html
import logging
from typing import Any

from api.models import MedicalReport

logger = logging.getLogger("medinsight.report.html")


class HtmlExporter:
    """Exports MedicalReport to modern, styled HTML."""

    def __init__(self):
        pass

    def _badge(self, text: str, variant: str = "default") -> str:
        color_map = {
            "high": "background:#fee2e2; color:#991b1b; border:1px solid #f87171;",
            "moderate": "background:#fef3c7; color:#92400e; border:1px solid #fcd34d;",
            "low": "background:#dcfce7; color:#166534; border:1px solid #86efac;",
            "uncertain": "background:#f1f5f9; color:#475569; border:1px solid #cbd5e1;",
            "abnormal": "background:#fee2e2; color:#b91c1c; font-weight:600;",
            "normal": "background:#f0fdf4; color:#15803d;",
            "default": "background:#e2e8f0; color:#1e293b;",
        }
        style = color_map.get(variant.lower(), color_map["default"])
        safe_text = html.escape(str(text))
        return f'<span style="display:inline-block; padding:2px 8px; border-radius:4px; font-size:11px; text-transform:uppercase; {style}">{safe_text}</span>'

    def export_html(self, report: MedicalReport) -> str:
        """Render MedicalReport to complete HTML document."""
        ov = report.patient_overview
        ov_id = html.escape(str(ov.get("patient_id", "N/A")))
        ov_age = html.escape(str(ov.get("age", "N/A")))
        ov_sex = html.escape(str(ov.get("sex", "N/A")))
        ov_blood = html.escape(str(ov.get("blood_group", "N/A")))

        # Executive summary paragraphs
        summary_html = "".join([f"<p>{html.escape(p)}</p>" for p in report.executive_summary.split("\n\n") if p.strip()])

        # Document processing rows
        doc_rows = ""
        for d in report.document_processing:
            doc_rows += f"""<tr>
                <td>{html.escape(d.filename)}</td>
                <td>{self._badge(d.file_type)}</td>
                <td>{d.pages_processed}</td>
                <td>{html.escape(d.extraction_method)}</td>
                <td>{html.escape(d.ocr_confidence)}</td>
            </tr>"""

        # Timeline rows
        timeline_rows = ""
        for t in report.timeline:
            timeline_rows += f"""<tr>
                <td style="font-weight:600; white-space:nowrap;">{html.escape(t.date)}</td>
                <td>{self._badge(t.category)}</td>
                <td><strong>{html.escape(t.event)}</strong></td>
                <td>{html.escape(t.details)}</td>
            </tr>"""

        # Existing conditions rows
        cond_rows = ""
        for c in report.existing_conditions:
            cond_rows += f"""<tr>
                <td><strong>{html.escape(c.get('condition', ''))}</strong></td>
                <td>{self._badge(c.get('status', 'active'))}</td>
                <td>{html.escape(str(c.get('date', 'N/A')))}</td>
                <td>{html.escape(c.get('notes', ''))}</td>
            </tr>"""

        # Lab results rows
        lab_rows = ""
        for l in report.lab_results:
            is_ab = l.get("is_abnormal", False)
            badge_html = self._badge("Abnormal", "abnormal") if is_ab else self._badge("Normal", "normal")
            val_style = "color:#b91c1c; font-weight:600;" if is_ab else ""
            lab_rows += f"""<tr>
                <td>{html.escape(l.get('test_name', ''))}</td>
                <td style="{val_style}">{html.escape(str(l.get('value', '')))} {html.escape(str(l.get('unit', '')))}</td>
                <td>{html.escape(str(l.get('reference_range', 'N/A')))}</td>
                <td>{badge_html}</td>
                <td>{html.escape(str(l.get('date', 'N/A')))}</td>
            </tr>"""

        # Patterns and trends
        trends_html = ""
        for tr in report.patterns_and_trends:
            trends_html += f"""<div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:12px; margin-bottom:10px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <strong style="color:#0f172a; font-size:14px;">{html.escape(tr.parameter)}</strong>
                    <div>{self._badge(tr.direction)} {self._badge(tr.evidence_strength)}</div>
                </div>
                <p style="margin:0; font-size:13px; color:#334155;">{html.escape(tr.clinical_significance)}</p>
            </div>"""

        # Risks rows
        risk_rows = ""
        for r in report.risks:
            cat_str = str(r.risk_category.value if hasattr(r.risk_category, "value") else r.risk_category).lower()
            risk_rows += f"""<tr>
                <td><strong>{html.escape(r.risk)}</strong></td>
                <td>{self._badge(cat_str, cat_str)}</td>
                <td>{html.escape(r.patient_evidence)}</td>
                <td>{html.escape(r.follow_up)}</td>
            </tr>"""

        # Treatment options
        tx_rows = ""
        for opt in report.treatment_options:
            cites = f" [Ref: {', '.join(str(c) for c in opt.citations)}]" if opt.citations else ""
            tx_rows += f"""<tr>
                <td><strong>{html.escape(opt.treatment)}</strong></td>
                <td>{html.escape(opt.purpose)}</td>
                <td>{html.escape(opt.monitoring)}</td>
                <td>{html.escape(opt.evidence_source)}{cites}</td>
            </tr>"""

        # Medication review
        med_rows = ""
        for m in report.medication_review:
            med_rows += f"""<tr>
                <td><strong>{html.escape(m.medication)}</strong></td>
                <td>{html.escape(m.concern)}</td>
                <td>{html.escape(m.recommendation)}</td>
            </tr>"""

        # Allergy alerts
        allergy_html = ""
        if report.allergy_flags:
            allergy_html = "<div style='margin-bottom:12px;'>"
            for a in report.allergy_flags:
                allergy_html += f"""<div style="background:#fee2e2; border:1px solid #f87171; border-radius:6px; padding:10px; margin-bottom:6px; color:#991b1b; font-size:13px;">
                    <strong>ALLERGY WARNING:</strong> {html.escape(a.get('allergen', ''))} — {html.escape(a.get('risk_note', ''))}
                </div>"""
            allergy_html += "</div>"

        # Preventive care list
        prev_html = ""
        for p in report.preventive_care:
            prev_html += f"""<li style="margin-bottom:6px;">
                <strong>{html.escape(p.get('measure', ''))}</strong> ({html.escape(p.get('frequency', ''))}): {html.escape(p.get('rational', ''))}
            </li>"""

        # Missing info & Contradictions
        missing_items = "".join([f"<li style='margin-bottom:4px;'>{html.escape(m)}</li>" for m in report.missing_information])
        conflict_items = "".join([f"<li style='margin-bottom:4px;'>{html.escape(c)}</li>" for c in report.contradictions])

        # Doctor questions
        doc_q_html = "".join([f"<li style='margin-bottom:6px; font-weight:500;'>{html.escape(q)}</li>" for q in report.doctor_questions])

        # Urgent findings
        urgent_html = ""
        for u in report.urgent_findings:
            urgent_html += f"""<div style="background:#fff1f2; border-left:4px solid #e11d48; padding:10px; margin-bottom:8px; font-size:13px;">
                <span style="color:#e11d48; font-weight:bold;">[{html.escape(u.get('severity', 'ATTENTION').upper())}]</span>
                <strong>{html.escape(u.get('finding', ''))}</strong> — {html.escape(u.get('recommended_action', ''))}
            </div>"""

        # Citations
        citations_html = ""
        for c in report.citations:
            citations_html += f"""<div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:10px; margin-bottom:8px; font-size:12px;">
                <strong>[{c.id}] {html.escape(c.source_title)}</strong> ({html.escape(c.source_publisher)}, {html.escape(c.page_or_section)})<br/>
                <span style="color:#64748b; font-style:italic;">"{html.escape(c.relevant_passage)}"</span>
            </div>"""

        # Limitations
        limits_html = "".join([f"<li style='margin-bottom:4px; font-size:12px; color:#475569;'>{html.escape(lim)}</li>" for lim in report.limitations])

        full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MedInsight AI — Report {html.escape(report.report_id)}</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f1f5f9;
            color: #0f172a;
            margin: 0;
            padding: 24px;
            line-height: 1.5;
        }}
        .container {{
            max-width: 900px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
            overflow: hidden;
            padding: 36px;
        }}
        .header {{
            border-bottom: 2px solid #1e3a8a;
            padding-bottom: 16px;
            margin-bottom: 24px;
        }}
        .header h1 {{
            margin: 0 0 6px 0;
            color: #1e3a8a;
            font-size: 24px;
        }}
        .meta-bar {{
            font-size: 13px;
            color: #64748b;
        }}
        .disclaimer-banner {{
            background: #fef2f2;
            border: 1px solid #f87171;
            border-radius: 6px;
            padding: 12px 16px;
            margin-bottom: 24px;
            font-size: 12px;
            color: #991b1b;
        }}
        h2 {{
            color: #1e3a8a;
            font-size: 17px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
            margin-top: 28px;
            margin-bottom: 14px;
        }}
        h3 {{
            color: #0284c7;
            font-size: 14px;
            margin-top: 14px;
            margin-bottom: 8px;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
            font-size: 12px;
        }}
        th {{
            background: #1e3a8a;
            color: #ffffff;
            font-weight: 600;
            text-align: left;
            padding: 8px 10px;
        }}
        td {{
            padding: 8px 10px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: top;
        }}
        tr:nth-child(even) td {{
            background: #f8fafc;
        }}
        .grid-3 {{
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 20px;
        }}
        .card {{
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 10px;
            font-size: 13px;
        }}
        .footer-disclaimer {{
            background: #fff1f2;
            border: 1px solid #e11d48;
            border-radius: 6px;
            padding: 14px;
            margin-top: 32px;
            font-size: 12px;
            color: #881337;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>MedInsight AI — Medical Record Analysis</h1>
            <div class="meta-bar">
                Report ID: <strong>{html.escape(report.report_id)}</strong> | Generated: {html.escape(report.generated_at[:16].replace('T', ' '))}
            </div>
        </div>

        <div class="disclaimer-banner">
            <strong>CLINICAL SAFETY NOTICE:</strong> {html.escape(report.disclaimer)}
        </div>

        <h2>1. Executive Clinical Summary</h2>
        <div>{summary_html}</div>

        <h2>2. Patient Overview</h2>
        <div class="grid-3">
            <div class="card"><strong>Patient ID:</strong> {ov_id}</div>
            <div class="card"><strong>Age:</strong> {ov_age}</div>
            <div class="card"><strong>Sex:</strong> {ov_sex}</div>
            <div class="card"><strong>Blood Group:</strong> {ov_blood}</div>
            <div class="card"><strong>Diagnoses:</strong> {ov.get('total_diagnoses', 0)}</div>
            <div class="card"><strong>Medications:</strong> {ov.get('active_medications', 0)}</div>
        </div>

        <h2>3. Document Processing Summary</h2>
        <table>
            <thead><tr><th>Filename</th><th>Type</th><th>Pages</th><th>Method</th><th>OCR Quality</th></tr></thead>
            <tbody>{doc_rows}</tbody>
        </table>

        <h2>4. Medical History Timeline</h2>
        <table>
            <thead><tr><th>Date</th><th>Category</th><th>Event</th><th>Details</th></tr></thead>
            <tbody>{timeline_rows}</tbody>
        </table>

        <h2>5. Existing Conditions & Diagnoses</h2>
        <table>
            <thead><tr><th>Condition</th><th>Status</th><th>Documented Date</th><th>Notes</th></tr></thead>
            <tbody>{cond_rows}</tbody>
        </table>

        <h2>6. Laboratory & Diagnostic Results</h2>
        <table>
            <thead><tr><th>Test Name</th><th>Value</th><th>Reference Range</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>{lab_rows}</tbody>
        </table>

        <h2>7. Patterns and Longitudinal Trends</h2>
        {trends_html}

        <h2>8. Potential Clinical Risks and Complications</h2>
        <table>
            <thead><tr><th>Risk Description</th><th>Category</th><th>Documented Patient Evidence</th><th>Recommended Follow-Up</th></tr></thead>
            <tbody>{risk_rows}</tbody>
        </table>

        <h2>9. Evidence-Based Treatment & Management Options</h2>
        <table>
            <thead><tr><th>Treatment / Strategy</th><th>Guideline Purpose</th><th>Monitoring</th><th>Evidence Source</th></tr></thead>
            <tbody>{tx_rows}</tbody>
        </table>

        <h2>10. Medication and Allergy Review</h2>
        {allergy_html}
        <table>
            <thead><tr><th>Medication</th><th>Clinical Concern / Context</th><th>Recommendation for Doctor</th></tr></thead>
            <tbody>{med_rows}</tbody>
        </table>

        <h2>11. Preventive Care and Surveillance</h2>
        <ul>{prev_html}</ul>

        <h2>12. Missing Clinical Data and Record Discrepancies</h2>
        <h3>Missing Information</h3>
        <ul>{missing_items}</ul>
        <h3>Contradictions</h3>
        <ul>{conflict_items}</ul>

        <h2>13. Questions for Treating Clinician</h2>
        <ol>{doc_q_html}</ol>

        <h2>14. Urgent Findings & Priority Clinical Flags</h2>
        {urgent_html}

        <h2>15. References and Clinical Evidence</h2>
        {citations_html}

        <h2>16. Limitations and Legal Disclaimer</h2>
        <ul>{limits_html}</ul>

        <div class="footer-disclaimer">
            <strong>LEGAL & MEDICAL DISCLAIMER:</strong> {html.escape(report.disclaimer)}
        </div>
    </div>
</body>
</html>"""
        return full_html


# Global singleton instance
html_exporter = HtmlExporter()
