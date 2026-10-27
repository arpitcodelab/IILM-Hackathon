import React, { useState } from 'react';
import {
  Download,
  FileCode,
  Printer,
  RotateCcw,
  Loader2,
  Check,
} from 'lucide-react';
import { MedicalReport } from '../types';
import { downloadReportPdf } from '../api/client';

interface ExportButtonsProps {
  report: MedicalReport;
  onNewAnalysis: () => void;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  report,
  onNewAnalysis,
}) => {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handlePdfDownload = async () => {
    try {
      setIsDownloadingPdf(true);
      if (report.analysis_id) {
        await downloadReportPdf(
          report.analysis_id,
          `MedInsight_Report_${report.analysis_id.slice(0, 8)}.pdf`
        );
      } else {
        // Fallback to native browser print-to-PDF
        window.print();
      }
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch {
      // If backend endpoint for PDF isn't configured, fallback to window.print()
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleExportHtml = () => {
    const reportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>MedInsight AI Medical Report - ${report.report_id || 'Summary'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 900px; margin: 40px auto; padding: 0 20px; }
    h1 { color: #0369a1; border-bottom: 2px solid #e0f2fe; padding-bottom: 10px; }
    h2 { color: #0f172a; margin-top: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    th { background: #f8fafc; font-weight: 600; }
    .disclaimer { background: #fffbeb; border: 1px solid #fde68a; color: #78350f; padding: 12px; border-radius: 6px; margin-bottom: 20px; font-size: 0.9em; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.8em; font-weight: 600; }
    .badge-urgent { background: #ffe4e6; color: #9f1239; }
    .meta { color: #64748b; font-size: 0.9em; margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>MedInsight AI — Clinical Record Synthesis</h1>
  <div class="meta">
    Report ID: ${report.report_id} | Generated: ${new Date(report.generated_at).toLocaleString()}
  </div>
  <div class="disclaimer">
    <strong>Medical Disclaimer:</strong> ${report.disclaimer}
  </div>

  <h2>1. Executive Summary</h2>
  <p>${report.executive_summary || 'No executive summary available.'}</p>

  <h2>2. Patient Overview</h2>
  <pre>${JSON.stringify(report.patient_overview, null, 2)}</pre>

  <h2>3. Document Processing Summary</h2>
  <p>${report.document_processing.length} document(s) processed.</p>

  <h2>4. Medical History Timeline</h2>
  <table>
    <thead><tr><th>Date</th><th>Event</th><th>Category</th><th>Source</th></tr></thead>
    <tbody>
      ${report.timeline.map(e => `<tr><td>${e.date}</td><td><strong>${e.event}</strong><br/>${e.details}</td><td>${e.category}</td><td>${e.source_document}</td></tr>`).join('')}
    </tbody>
  </table>

  <h2>5. Existing Conditions</h2>
  <pre>${JSON.stringify(report.existing_conditions, null, 2)}</pre>

  <h2>6. Laboratory Results</h2>
  <pre>${JSON.stringify(report.lab_results, null, 2)}</pre>

  <h2>7. Patterns and Trends</h2>
  <pre>${JSON.stringify(report.patterns_and_trends, null, 2)}</pre>

  <h2>8. Potential Risks</h2>
  <pre>${JSON.stringify(report.risks, null, 2)}</pre>

  <h2>9. Treatment Options</h2>
  <pre>${JSON.stringify(report.treatment_options, null, 2)}</pre>

  <h2>10. Medication & Allergy Review</h2>
  <pre>${JSON.stringify(report.medication_review, null, 2)}</pre>

  <h2>11. Preventive Care</h2>
  <pre>${JSON.stringify(report.preventive_care, null, 2)}</pre>

  <h2>12. Missing Information & Contradictions</h2>
  <ul>
    ${report.missing_information.map(m => `<li>Missing: ${m}</li>`).join('')}
    ${report.contradictions.map(c => `<li>Contradiction: ${c}</li>`).join('')}
  </ul>

  <h2>13. Questions for Treating Physician</h2>
  <ol>
    ${report.doctor_questions.map(q => `<li>${q}</li>`).join('')}
  </ol>

  <h2>14. Urgent Findings</h2>
  <pre>${JSON.stringify(report.urgent_findings, null, 2)}</pre>

  <h2>15. References & Evidence</h2>
  <pre>${JSON.stringify(report.citations, null, 2)}</pre>

  <h2>16. Limitations</h2>
  <ul>
    ${report.limitations.map(l => `<li>${l}</li>`).join('')}
  </ul>
</body>
</html>`;

    const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MedInsight_Report_${report.report_id.slice(0, 8)}.html`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs no-print">
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={onNewAnalysis}
          className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs transition-colors"
        >
          <RotateCcw className="w-4 h-4 mr-2 text-slate-500" />
          New Analysis
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Print Button */}
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center px-3.5 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs transition-colors"
          title="Print or Save as PDF via Browser"
        >
          <Printer className="w-4 h-4 mr-1.5 text-slate-500" />
          Print
        </button>

        {/* HTML Export Button */}
        <button
          type="button"
          onClick={handleExportHtml}
          className="inline-flex items-center px-3.5 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs transition-colors"
          title="Export Standalone HTML file"
        >
          <FileCode className="w-4 h-4 mr-1.5 text-slate-500" />
          Export HTML
        </button>

        {/* PDF Download Button */}
        <button
          type="button"
          onClick={handlePdfDownload}
          disabled={isDownloadingPdf}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 shadow-xs transition-colors"
        >
          {isDownloadingPdf ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Preparing PDF...
            </>
          ) : downloadSuccess ? (
            <>
              <Check className="w-4 h-4 mr-2 text-emerald-200" />
              Downloaded!
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
};
