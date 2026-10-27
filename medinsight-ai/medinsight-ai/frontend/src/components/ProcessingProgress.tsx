import React, { useEffect, useState, useRef } from 'react';
import {
  CheckCircle2,
  Loader2,
  Clock,
  AlertCircle,
  FileSearch,
  ScanText,
  Database,
  BookOpen,
  BrainCircuit,
  FileCheck2,
  Upload,
} from 'lucide-react';
import { AnalysisStatus, AnalysisStatusResponse } from '../types';
import { getAnalysisStatus } from '../api/client';

interface StageDefinition {
  key: AnalysisStatus;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ORDERED_STAGES: StageDefinition[] = [
  {
    key: AnalysisStatus.UPLOADING,
    title: 'Uploading Documents',
    description: 'Securing files and validating formats',
    icon: Upload,
  },
  {
    key: AnalysisStatus.EXTRACTING_TEXT,
    title: 'Extracting Text',
    description: 'Parsing digital records, layouts, and document structure',
    icon: FileSearch,
  },
  {
    key: AnalysisStatus.RUNNING_OCR,
    title: 'Running OCR',
    description: 'Processing scanned forms, handwriting, and image tables',
    icon: ScanText,
  },
  {
    key: AnalysisStatus.STRUCTURING_DATA,
    title: 'Structuring Clinical Data',
    description: 'Normalizing vitals, lab panels, medications, and dates',
    icon: Database,
  },
  {
    key: AnalysisStatus.RETRIEVING_EVIDENCE,
    title: 'Retrieving Clinical Evidence',
    description: 'Querying medical literature, guidelines, and drug interactions',
    icon: BookOpen,
  },
  {
    key: AnalysisStatus.ANALYZING,
    title: 'Clinical AI Synthesis',
    description: 'Analyzing trends, identifying complications, and risk factors',
    icon: BrainCircuit,
  },
  {
    key: AnalysisStatus.GENERATING_REPORT,
    title: 'Generating Report',
    description: 'Formatting 16-section structured medical synthesis',
    icon: FileCheck2,
  },
];

interface ProcessingProgressProps {
  analysisId: string;
  onCompleted: () => void;
  onError: (errorMessage: string) => void;
}

export const ProcessingProgress: React.FC<ProcessingProgressProps> = ({
  analysisId,
  onCompleted,
  onError,
}) => {
  const [currentStatus, setCurrentStatus] = useState<AnalysisStatusResponse | null>(null);
  const [pollErrorCount, setPollErrorCount] = useState<number>(0);
  const isCompletedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!analysisId) return;

    let isMounted = true;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const pollStatus = async () => {
      try {
        const response = await getAnalysisStatus(analysisId);
        if (!isMounted) return;

        setCurrentStatus(response);
        setPollErrorCount(0);

        if (response.status === AnalysisStatus.COMPLETED) {
          if (!isCompletedRef.current) {
            isCompletedRef.current = true;
            onCompleted();
          }
          return;
        }

        if (response.status === AnalysisStatus.FAILED) {
          onError(response.error || 'Medical record analysis failed to complete.');
          return;
        }

        // Continue polling every 2 seconds for in-progress statuses
        timerId = setTimeout(pollStatus, 2000);
      } catch (err: unknown) {
        if (!isMounted) return;
        const errMsg = err instanceof Error ? err.message : String(err);
        setPollErrorCount((prev) => {
          const next = prev + 1;
          if (next >= 5) {
            onError(`Network or server error while tracking analysis: ${errMsg}`);
          }
          return next;
        });

        // Retry polling even on transient network blips
        timerId = setTimeout(pollStatus, 3000);
      }
    };

    pollStatus();

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [analysisId, onCompleted, onError]);

  // Determine stage progression index
  const getStageIndex = (status?: AnalysisStatus) => {
    if (!status) return 0;
    if (status === AnalysisStatus.COMPLETED) return ORDERED_STAGES.length;
    const idx = ORDERED_STAGES.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  const activeIndex = getStageIndex(currentStatus?.status);
  const progressPct =
    currentStatus?.progress_pct && currentStatus.progress_pct > 0
      ? currentStatus.progress_pct
      : Math.min(Math.round(((activeIndex + 0.5) / ORDERED_STAGES.length) * 100), 98);

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Analyzing Medical Records
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Analysis ID: <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono text-xs">{analysisId}</code>
          </p>
        </div>

        {/* Global Progress % Badge */}
        <div className="flex items-center sm:flex-col sm:items-end justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Overall Progress</span>
          <span className="text-2xl font-bold text-sky-600 font-mono">
            {progressPct}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-sky-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {currentStatus?.stage_detail && (
          <p className="mt-2 text-xs font-medium text-slate-600 flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block mr-2 animate-pulse" />
            {currentStatus.stage_detail}
          </p>
        )}
      </div>

      {/* Stage Breakdown List */}
      <div className="mt-8 space-y-3">
        {ORDERED_STAGES.map((stage, idx) => {
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex && currentStatus?.status !== AnalysisStatus.COMPLETED;
          const isPending = idx > activeIndex;

          const IconComponent = stage.icon;

          return (
            <div
              key={stage.key}
              className={`flex items-start p-3.5 rounded-xl border transition-all duration-200 ${
                isCurrent
                  ? 'bg-sky-50/60 border-sky-300 ring-1 ring-sky-200 shadow-xs'
                  : isDone
                  ? 'bg-slate-50/50 border-slate-200/80 text-slate-700'
                  : 'bg-white border-transparent text-slate-400 opacity-60'
              }`}
            >
              {/* Status Indicator Icon */}
              <div className="shrink-0 mr-3.5 mt-0.5">
                {isDone ? (
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  </div>
                ) : isCurrent ? (
                  <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Stage Description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <IconComponent
                    className={`w-4 h-4 shrink-0 ${
                      isCurrent ? 'text-sky-600' : isDone ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  />
                  <h3
                    className={`text-sm font-semibold truncate ${
                      isCurrent ? 'text-sky-950 font-bold' : isDone ? 'text-slate-800' : 'text-slate-500'
                    }`}
                  >
                    {stage.title}
                  </h3>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-200/70 text-sky-800 uppercase tracking-wider animate-pulse">
                      In Progress
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[10px] text-emerald-700 font-medium">
                      Done
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {stage.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Network Notice if transient polling issues */}
      {pollErrorCount > 0 && pollErrorCount < 5 && (
        <div className="mt-4 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Syncing status with backend (attempt {pollErrorCount}/5)...</span>
        </div>
      )}
    </div>
  );
};
