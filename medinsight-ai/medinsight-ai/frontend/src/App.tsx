import { useState } from 'react';
import './App.css';
import { AlertCircle, RotateCcw, ShieldCheck, Stethoscope } from 'lucide-react';
import { Header } from './components/Header';
import { Disclaimer } from './components/Disclaimer';
import { FileUpload } from './components/FileUpload';
import { ProcessingProgress } from './components/ProcessingProgress';
import { ReportViewer } from './components/ReportViewer';
import { OcrPreview } from './components/OcrPreview';
import { submitAnalysis, getReport, getExtractionPreview } from './api/client';
import { MedicalReport, ExtractionPreview } from './types';

type AppWorkflowState = 'idle' | 'uploading' | 'processing' | 'report_ready' | 'error';

export function App() {
  const [workflowState, setWorkflowState] = useState<AppWorkflowState>('idle');
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [report, setReport] = useState<MedicalReport | null>(null);
  const [ocrPreview, setOcrPreview] = useState<ExtractionPreview | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUploadedFiles, setLastUploadedFiles] = useState<File[]>([]);

  // Start analysis pipeline
  const handleStartAnalysis = async (files: File[]) => {
    try {
      setErrorMessage(null);
      setLastUploadedFiles(files);
      setWorkflowState('uploading');

      const response = await submitAnalysis(files);
      if (!response.analysis_id) {
        throw new Error('Server did not return a valid analysis ID.');
      }

      setAnalysisId(response.analysis_id);
      setWorkflowState('processing');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit documents for analysis.';
      setErrorMessage(msg);
      setWorkflowState('error');
    }
  };

  // Called when ProcessingProgress completes successfully
  const handleProcessingCompleted = async () => {
    if (!analysisId) return;

    try {
      // Fetch full report
      const fullReport = await getReport(analysisId);
      setReport(fullReport);

      // Attempt to load OCR preview if available (non-blocking)
      try {
        const preview = await getExtractionPreview(analysisId);
        setOcrPreview(preview);
      } catch {
        // OCR preview is optional enrichment
      }

      setWorkflowState('report_ready');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load finalized report from backend.';
      setErrorMessage(msg);
      setWorkflowState('error');
    }
  };

  const handleProcessingError = (errMsg: string) => {
    setErrorMessage(errMsg);
    setWorkflowState('error');
  };

  // Reset entire application to initial state
  const handleReset = () => {
    setWorkflowState('idle');
    setAnalysisId(null);
    setReport(null);
    setOcrPreview(null);
    setErrorMessage(null);
    setLastUploadedFiles([]);
  };

  // Retry from failed state
  const handleRetry = () => {
    if (lastUploadedFiles.length > 0) {
      handleStartAnalysis(lastUploadedFiles);
    } else {
      handleReset();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Header */}
      <Header
        onReset={handleReset}
        showNewAnalysis={workflowState === 'report_ready'}
      />

      {/* Top Disclaimer Banner */}
      <Disclaimer customText={report?.disclaimer} />

      {/* Main App Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* State 1: File Upload */}
        {(workflowState === 'idle' || workflowState === 'uploading') && (
          <div className="space-y-8 animate-fadeIn">
            {/* Feature Highlights Banner */}
            <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-2">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-semibold text-slate-800">16-Section Synthesis</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Comprehensive, structured clinical evaluation</p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-semibold text-slate-800">Evidence Citations</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Anchored directly in clinical literature</p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-2">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-semibold text-slate-800">Multi-Doc Timeline</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Cross-document longitudinal history</p>
              </div>
            </div>

            {/* File Upload Box */}
            <FileUpload
              onAnalyze={handleStartAnalysis}
              isLoading={workflowState === 'uploading'}
            />
          </div>
        )}

        {/* State 2: Processing Progress */}
        {workflowState === 'processing' && analysisId && (
          <div className="py-6">
            <ProcessingProgress
              analysisId={analysisId}
              onCompleted={handleProcessingCompleted}
              onError={handleProcessingError}
            />
          </div>
        )}

        {/* State 3: Report Ready */}
        {workflowState === 'report_ready' && report && (
          <div className="space-y-6">
            {/* Optional OCR Preview Accordion */}
            {ocrPreview && ocrPreview.documents && ocrPreview.documents.length > 0 && (
              <OcrPreview
                documents={ocrPreview.documents}
                hasUncertainties={ocrPreview.has_uncertainties}
              />
            )}

            {/* Complete 16-section report viewer */}
            <ReportViewer report={report} onNewAnalysis={handleReset} />
          </div>
        )}

        {/* State 4: Error Display */}
        {workflowState === 'error' && (
          <div className="max-w-xl mx-auto my-12 bg-white rounded-2xl border border-rose-200 shadow-sm p-6 sm:p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Analysis Encountered an Error
              </h3>
              <p className="text-sm text-rose-800 mt-2 bg-rose-50 p-3 rounded-lg border border-rose-100 font-mono text-left whitespace-pre-wrap">
                {errorMessage || 'An unexpected failure occurred while analyzing the medical documents.'}
              </p>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
              >
                Start Over
              </button>
              <button
                type="button"
                onClick={handleRetry}
                className="px-5 py-2 text-sm font-semibold rounded-lg text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-xs"
              >
                Retry Analysis
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto text-xs text-slate-400 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p>© {new Date().getFullYear()} MedInsight AI. For informational and clinical decision support only.</p>
          <p className="text-slate-400">Strict zero-retention analysis • No personal identifiable data stored</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
