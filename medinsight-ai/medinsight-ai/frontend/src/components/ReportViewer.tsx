import React, { useState } from 'react';
import {
  FileText,
  User,
  Files,
  Calendar,
  Stethoscope,
  FlaskConical,
  TrendingUp,
  AlertOctagon,
  Pill,
  ShieldCheck,
  HelpCircle,
  AlertTriangle,
  BookOpen,
  Info,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Clock,
  Sparkles,
} from 'lucide-react';
import { MedicalReport, TimelineEvent, RiskItem, TreatmentOption, MedicationReviewItem, TrendObservation } from '../types';
import { ReportSection } from './ReportSection';
import { ExportButtons } from './ExportButtons';

interface ReportViewerProps {
  report: MedicalReport;
  onNewAnalysis: () => void;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({
  report,
  onNewAnalysis,
}) => {
  const [globalExpandState, setGlobalExpandState] = useState<boolean | null>(null);

  const toggleAll = (expand: boolean) => {
    setGlobalExpandState(expand);
  };

  const patientName = String(report.patient_overview?.name || 'Patient Record');
  const patientAge = report.patient_overview?.age ? String(report.patient_overview.age) : null;
  const patientSex = report.patient_overview?.sex ? String(report.patient_overview.sex) : null;
  const patientBlood = report.patient_overview?.blood_group ? String(report.patient_overview.blood_group) : null;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-16 report-container">
      {/* Top Export and Action Bar */}
      <ExportButtons report={report} onNewAnalysis={onNewAnalysis} />

      {/* Main Report Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Report Header */}
        <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-slate-900 text-white p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-200 text-xs font-medium border border-sky-400/30 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                <span>Clinical Synthesis Report</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Comprehensive Medical Evaluation
              </h1>
              <p className="text-sky-100/80 text-xs sm:text-sm mt-1">
                Generated {new Date(report.generated_at).toLocaleString()} • ID:{' '}
                <span className="font-mono">{report.report_id.slice(0, 8)}</span>
              </p>
            </div>

            {/* Patient Badge */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3.5 min-w-[200px] text-xs space-y-1">
              <div className="flex items-center space-x-2 font-semibold text-white text-sm">
                <User className="w-4 h-4 text-sky-300" />
                <span>{patientName}</span>
              </div>
              <div className="text-sky-200/90 flex flex-wrap gap-x-3 gap-y-1">
                {patientAge && <span>Age: {patientAge}</span>}
                {patientSex && <span>Sex: {patientSex}</span>}
                {patientBlood && <span>Blood: {patientBlood}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Global Expand / Collapse Toolbar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs text-slate-600 no-print">
          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-slate-800">16 Structured Sections</span>
            <span className="text-slate-400">• Evidence-backed clinical summary</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => toggleAll(true)}
              className="hover:text-sky-700 font-medium inline-flex items-center space-x-1"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Expand All</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => toggleAll(false)}
              className="hover:text-sky-700 font-medium inline-flex items-center space-x-1"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Collapse All</span>
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 bg-slate-50/30">
          {/* SECTION 1: EXECUTIVE SUMMARY */}
          <ReportSection
            id="sec-1"
            sectionNumber={1}
            title="Executive Summary"
            icon={<FileText className="w-5 h-5 text-sky-600" />}
            forceExpanded={globalExpandState}
          >
            <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line bg-sky-50/40 p-4 rounded-xl border border-sky-100">
              {report.executive_summary || 'No executive summary provided in analysis.'}
            </div>
          </ReportSection>

          {/* SECTION 2: PATIENT RECORD OVERVIEW */}
          <ReportSection
            id="sec-2"
            sectionNumber={2}
            title="Patient Record Overview"
            icon={<User className="w-5 h-5 text-indigo-600" />}
            forceExpanded={globalExpandState}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-400 font-medium">Patient Name</span>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{patientName}</p>
              </div>
              <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-400 font-medium">Age & Gender</span>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  {patientAge || 'Unknown'} / {patientSex || 'Unknown'}
                </p>
              </div>
              <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-400 font-medium">Blood Group</span>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{patientBlood || 'Unspecified'}</p>
              </div>
              <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-400 font-medium">Date Range of Records</span>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  {String(report.patient_overview?.date_range || 'Multiple dates')}
                </p>
              </div>
            </div>

            {/* Medical, Surgical, and Family History */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">Medical History</h4>
                {Array.isArray(report.patient_overview?.medical_history) &&
                (report.patient_overview.medical_history as string[]).length > 0 ? (
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    {(report.patient_overview.medical_history as string[]).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400 italic">No prior medical history noted</p>
                )}
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">Surgical History</h4>
                {Array.isArray(report.patient_overview?.surgical_history) &&
                (report.patient_overview.surgical_history as string[]).length > 0 ? (
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    {(report.patient_overview.surgical_history as string[]).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400 italic">No surgical history documented</p>
                )}
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">Family & Social History</h4>
                {Array.isArray(report.patient_overview?.family_history) &&
                (report.patient_overview.family_history as string[]).length > 0 ? (
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    {(report.patient_overview.family_history as string[]).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400 italic">No family history flagged</p>
                )}
              </div>
            </div>
          </ReportSection>

          {/* SECTION 3: DOCUMENT PROCESSING SUMMARY */}
          <ReportSection
            id="sec-3"
            sectionNumber={3}
            title="Document Processing Summary"
            icon={<Files className="w-5 h-5 text-slate-600" />}
            badge={`${report.document_processing.length} doc${report.document_processing.length === 1 ? '' : 's'}`}
            forceExpanded={globalExpandState}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-left border border-slate-200 rounded-lg">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-3.5 py-2.5">Document Name</th>
                    <th className="px-3.5 py-2.5">Format</th>
                    <th className="px-3.5 py-2.5">Pages</th>
                    <th className="px-3.5 py-2.5">Extraction Method</th>
                    <th className="px-3.5 py-2.5">OCR Confidence</th>
                    <th className="px-3.5 py-2.5">Warnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {report.document_processing.map((doc, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-3.5 py-2.5 font-medium text-slate-900">{doc.filename}</td>
                      <td className="px-3.5 py-2.5 uppercase font-mono">{doc.file_type}</td>
                      <td className="px-3.5 py-2.5">{doc.pages_processed}</td>
                      <td className="px-3.5 py-2.5 capitalize">{doc.extraction_method || 'Digital'}</td>
                      <td className="px-3.5 py-2.5">
                        <span className="capitalize font-medium text-slate-700">{doc.ocr_confidence || 'High'}</span>
                      </td>
                      <td className="px-3.5 py-2.5 text-amber-700">
                        {doc.warnings && doc.warnings.length > 0 ? doc.warnings.join(', ') : 'None'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ReportSection>

          {/* SECTION 4: MEDICAL HISTORY TIMELINE */}
          <ReportSection
            id="sec-4"
            sectionNumber={4}
            title="Medical History Timeline"
            icon={<Calendar className="w-5 h-5 text-emerald-600" />}
            badge={report.timeline.length}
            forceExpanded={globalExpandState}
          >
            {report.timeline.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No historical timeline events extracted.</p>
            ) : (
              <div className="relative pl-6 border-l-2 border-sky-200 space-y-6">
                {report.timeline.map((item: TimelineEvent, idx: number) => (
                  <div key={idx} className="relative group">
                    {/* Timeline Node Icon */}
                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-sky-600 group-hover:scale-125 transition-transform" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-sky-100 text-sky-800 font-mono">
                          <Clock className="w-3 h-3 mr-1" />
                          {item.date || 'Unspecified Date'}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {item.category || 'Event'}
                        </span>
                        {item.source_document && (
                          <span className="text-[11px] text-slate-400 italic">
                            Source: {item.source_document}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">
                        {item.event}
                      </h4>
                      {item.details && (
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {item.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ReportSection>

          {/* SECTION 5: EXISTING CONDITIONS AND FINDINGS */}
          <ReportSection
            id="sec-5"
            sectionNumber={5}
            title="Existing Conditions & Findings"
            icon={<Stethoscope className="w-5 h-5 text-blue-600" />}
            badge={report.existing_conditions.length}
            forceExpanded={globalExpandState}
          >
            {report.existing_conditions.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No conditions identified.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {report.existing_conditions.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-semibold text-slate-900">
                        {String(item.condition || item.name || 'Condition')}
                      </h4>
                      {Boolean(item.status) && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium capitalize">
                          {String(item.status)}
                        </span>
                      )}
                    </div>
                    {Boolean(item.icd_code) && (
                      <p className="text-xs font-mono text-slate-500 mt-0.5">ICD: {String(item.icd_code)}</p>
                    )}
                    {Boolean(item.notes) && (
                      <p className="text-xs text-slate-600 mt-1.5">{String(item.notes)}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ReportSection>

          {/* SECTION 6: LABORATORY AND DIAGNOSTIC RESULTS */}
          <ReportSection
            id="sec-6"
            sectionNumber={6}
            title="Laboratory & Diagnostic Results"
            icon={<FlaskConical className="w-5 h-5 text-teal-600" />}
            badge={report.lab_results.length}
            forceExpanded={globalExpandState}
          >
            {report.lab_results.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No lab findings found in uploaded documents.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-left border border-slate-200 rounded-lg">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-3.5 py-2.5">Test Name</th>
                      <th className="px-3.5 py-2.5">Observed Value</th>
                      <th className="px-3.5 py-2.5">Unit</th>
                      <th className="px-3.5 py-2.5">Reference Range</th>
                      <th className="px-3.5 py-2.5">Status</th>
                      <th className="px-3.5 py-2.5">Date</th>
                      <th className="px-3.5 py-2.5">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {report.lab_results.map((lab, idx) => {
                      const isAbnormal = Boolean(lab.is_abnormal);
                      return (
                        <tr
                          key={idx}
                          className={isAbnormal ? 'bg-rose-50/50 hover:bg-rose-50' : 'hover:bg-slate-50'}
                        >
                          <td className="px-3.5 py-2.5 font-semibold text-slate-900">
                            {String(lab.test_name || lab.name || 'Test')}
                          </td>
                          <td className="px-3.5 py-2.5 font-mono font-medium">
                            {String(lab.value || '—')}
                          </td>
                          <td className="px-3.5 py-2.5 text-slate-500">{String(lab.unit || '')}</td>
                          <td className="px-3.5 py-2.5 text-slate-500">{String(lab.reference_range || '—')}</td>
                          <td className="px-3.5 py-2.5">
                            {isAbnormal ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                Abnormal
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Normal
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-2.5 text-slate-500 font-mono">
                            {typeof lab.date === 'object' && lab.date !== null
                              ? String((lab.date as Record<string, unknown>).original || '')
                              : String(lab.date || '—')}
                          </td>
                          <td className="px-3.5 py-2.5 text-slate-600">{String(lab.notes || '—')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </ReportSection>

          {/* SECTION 7: PATTERNS AND TRENDS */}
          <ReportSection
            id="sec-7"
            sectionNumber={7}
            title="Patterns and Clinical Trends"
            icon={<TrendingUp className="w-5 h-5 text-cyan-600" />}
            badge={report.patterns_and_trends.length}
            forceExpanded={globalExpandState}
          >
            {report.patterns_and_trends.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No longitudinal patterns or trends detected.</p>
            ) : (
              <div className="space-y-3">
                {report.patterns_and_trends.map((trend: TrendObservation, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <h4 className="text-sm font-bold text-slate-900">{trend.parameter}</h4>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-800 capitalize">
                        {trend.direction || 'Observed'}
                      </span>
                    </div>
                    {trend.clinical_significance && (
                      <p className="text-xs text-slate-700 leading-relaxed">
                        <strong className="text-slate-900">Significance:</strong> {trend.clinical_significance}
                      </p>
                    )}
                    {trend.evidence_strength && (
                      <p className="text-xs text-slate-500 mt-1">
                        Evidence Strength: <span className="font-medium text-slate-700">{trend.evidence_strength}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ReportSection>

          {/* SECTION 8: POTENTIAL RISKS AND COMPLICATIONS */}
          <ReportSection
            id="sec-8"
            sectionNumber={8}
            title="Potential Risks & Complications"
            icon={<AlertOctagon className="w-5 h-5 text-amber-600" />}
            badge={report.risks.length}
            badgeVariant={report.risks.length > 0 ? 'warning' : 'default'}
            forceExpanded={globalExpandState}
          >
            {report.risks.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No elevated risks identified.</p>
            ) : (
              <div className="space-y-3">
                {report.risks.map((item: RiskItem, idx: number) => (
                  <div key={idx} className="p-4 bg-amber-50/40 rounded-xl border border-amber-200/80">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-sm font-bold text-amber-950">{item.risk}</h4>
                      <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-amber-200 text-amber-900">
                        {item.risk_category || 'Risk'}
                      </span>
                    </div>
                    {item.patient_evidence && (
                      <p className="text-xs text-slate-700 mt-1">
                        <strong className="text-slate-900">Patient Evidence:</strong> {item.patient_evidence}
                      </p>
                    )}
                    {item.medical_evidence && (
                      <p className="text-xs text-slate-700 mt-1">
                        <strong className="text-slate-900">Clinical Literature:</strong> {item.medical_evidence}
                      </p>
                    )}
                    {item.follow_up && (
                      <p className="text-xs text-sky-800 mt-1 font-medium">
                        Recommended Follow-up: {item.follow_up}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ReportSection>

          {/* SECTION 9: TREATMENT AND MANAGEMENT OPTIONS */}
          <ReportSection
            id="sec-9"
            sectionNumber={9}
            title="Treatment & Management Options"
            icon={<Pill className="w-5 h-5 text-emerald-600" />}
            badge={report.treatment_options.length}
            forceExpanded={globalExpandState}
          >
            {report.treatment_options.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No specific treatment considerations listed.</p>
            ) : (
              <div className="space-y-3">
                {report.treatment_options.map((opt: TreatmentOption, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="text-sm font-bold text-slate-900">{opt.treatment}</h4>
                    {opt.purpose && (
                      <p className="text-xs text-slate-700 mt-1">
                        <strong>Purpose:</strong> {opt.purpose}
                      </p>
                    )}
                    {opt.when_considered && (
                      <p className="text-xs text-slate-700 mt-0.5">
                        <strong>When Considered:</strong> {opt.when_considered}
                      </p>
                    )}
                    {opt.contraindications && (
                      <p className="text-xs text-rose-700 mt-0.5">
                        <strong>Contraindications:</strong> {opt.contraindications}
                      </p>
                    )}
                    {opt.monitoring && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        <strong>Monitoring:</strong> {opt.monitoring}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ReportSection>

          {/* SECTION 10: MEDICATION AND ALLERGY REVIEW */}
          <ReportSection
            id="sec-10"
            sectionNumber={10}
            title="Medication & Allergy Review"
            icon={<Pill className="w-5 h-5 text-purple-600" />}
            badge={report.medication_review.length + (report.allergy_flags?.length || 0)}
            forceExpanded={globalExpandState}
          >
            {/* Allergy alerts if present */}
            {report.allergy_flags && report.allergy_flags.length > 0 && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-1">
                  Documented Allergies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {report.allergy_flags.map((allergy, aIdx) => (
                    <span
                      key={aIdx}
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-100 text-rose-800"
                    >
                      {allergy.allergen || String(allergy)}
                      {allergy.reaction ? ` (${allergy.reaction})` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Medication Review */}
            {report.medication_review.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No medication concerns or interactions flagged.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-left border border-slate-200 rounded-lg">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-3.5 py-2.5">Medication</th>
                      <th className="px-3.5 py-2.5">Clinical Concern</th>
                      <th className="px-3.5 py-2.5">Interaction With</th>
                      <th className="px-3.5 py-2.5">Severity</th>
                      <th className="px-3.5 py-2.5">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {report.medication_review.map((item: MedicationReviewItem, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-3.5 py-2.5 font-bold text-slate-900">{item.medication}</td>
                        <td className="px-3.5 py-2.5 text-slate-700">{item.concern || '—'}</td>
                        <td className="px-3.5 py-2.5 text-slate-600">{item.interaction_with || '—'}</td>
                        <td className="px-3.5 py-2.5">
                          <span className="font-semibold capitalize text-slate-700">{item.severity || 'Moderate'}</span>
                        </td>
                        <td className="px-3.5 py-2.5 text-slate-700">{item.recommendation || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ReportSection>

          {/* SECTION 11: PREVENTIVE CARE AND MONITORING */}
          <ReportSection
            id="sec-11"
            sectionNumber={11}
            title="Preventive Care & Monitoring"
            icon={<ShieldCheck className="w-5 h-5 text-green-600" />}
            badge={report.preventive_care.length}
            forceExpanded={globalExpandState}
          >
            {report.preventive_care.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No specific monitoring regimens identified.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {report.preventive_care.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <h4 className="font-semibold text-slate-900">{item.intervention || item.title || 'Screening'}</h4>
                    {item.interval && <p className="text-slate-600 mt-0.5">Interval: {item.interval}</p>}
                    {item.notes && <p className="text-slate-500 mt-1">{item.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </ReportSection>

          {/* SECTION 12: MISSING INFORMATION AND CONTRADICTIONS */}
          <ReportSection
            id="sec-12"
            sectionNumber={12}
            title="Missing Information & Contradictions"
            icon={<HelpCircle className="w-5 h-5 text-amber-600" />}
            badge={report.missing_information.length + report.contradictions.length}
            forceExpanded={globalExpandState}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200">
                <h4 className="font-bold text-amber-950 mb-2">Missing Information in Records</h4>
                {report.missing_information.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-1.5 text-amber-900">
                    {report.missing_information.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-amber-800/80 italic">No major data gaps noted.</p>
                )}
              </div>

              <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200">
                <h4 className="font-bold text-rose-950 mb-2">Contradictions Across Documents</h4>
                {report.contradictions.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-1.5 text-rose-900">
                    {report.contradictions.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-rose-800/80 italic">No direct clinical discrepancies found.</p>
                )}
              </div>
            </div>
          </ReportSection>

          {/* SECTION 13: QUESTIONS FOR THE TREATING DOCTOR */}
          <ReportSection
            id="sec-13"
            sectionNumber={13}
            title="Questions for the Treating Doctor"
            icon={<HelpCircle className="w-5 h-5 text-sky-600" />}
            badge={report.doctor_questions.length}
            forceExpanded={globalExpandState}
          >
            {report.doctor_questions.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No questions generated.</p>
            ) : (
              <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm text-slate-800">
                {report.doctor_questions.map((q, idx) => (
                  <li key={idx} className="leading-relaxed pl-1">
                    <span className="font-medium text-slate-900">{q}</span>
                  </li>
                ))}
              </ol>
            )}
          </ReportSection>

          {/* SECTION 14: URGENT FINDINGS AND SAFETY FLAGS */}
          <ReportSection
            id="sec-14"
            sectionNumber={14}
            title="Urgent Findings & Safety Flags"
            icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
            badge={report.urgent_findings.length}
            badgeVariant={report.urgent_findings.length > 0 ? 'urgent' : 'default'}
            forceExpanded={globalExpandState}
          >
            {report.urgent_findings.length === 0 ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium">
                No immediate critical safety flags or urgent findings detected in the provided records.
              </div>
            ) : (
              <div className="space-y-3">
                {report.urgent_findings.map((finding, idx) => (
                  <div key={idx} className="p-4 bg-rose-50 border-l-4 border-rose-600 rounded-r-xl">
                    <h4 className="text-sm font-bold text-rose-950">
                      {finding.title || finding.finding || 'Critical Finding'}
                    </h4>
                    <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                      {finding.description || finding.detail || JSON.stringify(finding)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ReportSection>

          {/* SECTION 15: REFERENCES AND EVIDENCE */}
          <ReportSection
            id="sec-15"
            sectionNumber={15}
            title="References & Clinical Evidence"
            icon={<BookOpen className="w-5 h-5 text-slate-700" />}
            badge={report.citations.length}
            forceExpanded={globalExpandState}
          >
            {report.citations.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No citation metadata attached.</p>
            ) : (
              <div className="space-y-3">
                {report.citations.map((c, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-slate-900">
                        [{c.id || idx + 1}] {c.source_title || 'Clinical Reference'}
                      </span>
                      {c.source_url && (
                        <a
                          href={c.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-600 hover:text-sky-800 inline-flex items-center space-x-1"
                        >
                          <span>Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    {c.source_publisher && (
                      <p className="text-slate-500 mt-0.5">
                        {c.source_publisher} {c.source_date ? `(${c.source_date})` : ''}
                      </p>
                    )}
                    {c.relevant_passage && (
                      <p className="text-slate-600 italic mt-1 bg-white p-2 rounded border border-slate-100">
                        "{c.relevant_passage}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ReportSection>

          {/* SECTION 16: LIMITATIONS AND DISCLAIMER */}
          <ReportSection
            id="sec-16"
            sectionNumber={16}
            title="Limitations & Medical Disclaimer"
            icon={<Info className="w-5 h-5 text-amber-700" />}
            forceExpanded={globalExpandState}
          >
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Identified AI & Extraction Limitations</h4>
                {report.limitations.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    {report.limitations.map((lim, idx) => (
                      <li key={idx}>{lim}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400 italic">Standard AI analysis bounds apply.</p>
                )}
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                <span className="font-bold block mb-1">Standard Medical Disclaimer:</span>
                <p className="leading-relaxed">{report.disclaimer}</p>
              </div>
            </div>
          </ReportSection>
        </div>
      </div>
    </div>
  );
};
