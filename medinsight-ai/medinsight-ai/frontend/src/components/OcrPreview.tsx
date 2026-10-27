import React, { useState } from 'react';
import {
  FileText,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Eye,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { ExtractedDocument, ConfidenceLevel } from '../types';

interface OcrPreviewProps {
  documents: ExtractedDocument[];
  hasUncertainties?: boolean;
}

export const OcrPreview: React.FC<OcrPreviewProps> = ({
  documents,
  hasUncertainties = false,
}) => {
  const [openDocIndex, setOpenDocIndex] = useState<number | null>(0);
  const [activePageIndex, setActivePageIndex] = useState<Record<number, number>>({});

  if (!documents || documents.length === 0) {
    return null;
  }

  const toggleDoc = (index: number) => {
    setOpenDocIndex(openDocIndex === index ? null : index);
  };

  const getConfidenceBadge = (confidence?: ConfidenceLevel | string) => {
    switch (confidence) {
      case ConfidenceLevel.HIGH:
      case 'high':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3 h-3 mr-1 text-emerald-600" /> High Confidence
          </span>
        );
      case ConfidenceLevel.MEDIUM:
      case 'medium':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
            Medium Confidence
          </span>
        );
      case ConfidenceLevel.LOW:
      case 'low':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800">
            <AlertTriangle className="w-3 h-3 mr-1 text-rose-600" /> Low Confidence
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs mb-6">
      {/* Header Banner */}
      <div className="bg-slate-50/80 px-4 py-3.5 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-semibold text-slate-800">
            OCR & Document Text Extraction Preview
          </h3>
          <span className="text-xs text-slate-500">
            ({documents.length} {documents.length === 1 ? 'file' : 'files'})
          </span>
        </div>

        {hasUncertainties && (
          <div className="flex items-center space-x-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Uncertain values flagged in yellow</span>
          </div>
        )}
      </div>

      {/* Document Accordion */}
      <div className="divide-y divide-slate-100">
        {documents.map((doc, docIdx) => {
          const isOpen = openDocIndex === docIdx;
          const pages = doc.pages || [];
          const currentSelectedPage = activePageIndex[docIdx] || 0;
          const activePage = pages[currentSelectedPage];

          return (
            <div key={doc.file_id || `${doc.filename}-${docIdx}`}>
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => toggleDoc(docIdx)}
                className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors focus:outline-none"
              >
                <div className="flex items-center space-x-3">
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-800">
                    {doc.filename}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({doc.total_pages || pages.length} pages)
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {doc.extraction_warnings && doc.extraction_warnings.length > 0 && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {doc.extraction_warnings.length} warning(s)
                    </span>
                  )}
                  <span className="text-xs uppercase font-mono px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                    {doc.file_type}
                  </span>
                </div>
              </button>

              {/* Accordion Body */}
              {isOpen && (
                <div className="px-4 pb-4 bg-slate-50/40">
                  {pages.length > 1 && (
                    <div className="flex flex-wrap gap-1.5 mb-3 pt-2">
                      {pages.map((p, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() =>
                            setActivePageIndex((prev) => ({
                              ...prev,
                              [docIdx]: pIdx,
                            }))
                          }
                          className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                            currentSelectedPage === pIdx
                              ? 'bg-sky-600 text-white shadow-2xs'
                              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          Page {p.page_number || pIdx + 1}
                        </button>
                      ))}
                    </div>
                  )}

                  {activePage ? (
                    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100 gap-2">
                        <div className="flex items-center space-x-3">
                          <span>
                            Method:{' '}
                            <strong className="text-slate-700 capitalize">
                              {activePage.extraction_method.replace('_', ' ')}
                            </strong>
                          </span>
                          {activePage.has_handwriting && (
                            <span className="text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 font-medium">
                              Handwriting detected
                            </span>
                          )}
                        </div>
                        {getConfidenceBadge(activePage.ocr_confidence)}
                      </div>

                      {/* Uncertain words callout */}
                      {activePage.uncertain_words && activePage.uncertain_words.length > 0 && (
                        <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-md text-xs text-amber-900">
                          <span className="font-semibold flex items-center gap-1 mb-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            Uncertain / Low Confidence Words:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {activePage.uncertain_words.map((w, wIdx) => (
                              <span
                                key={wIdx}
                                className="inline-block bg-amber-200/80 text-amber-950 font-mono px-1.5 py-0.5 rounded text-[11px]"
                                title={`Confidence: ${(w.confidence * 100).toFixed(1)}%`}
                              >
                                {w.text}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Extracted Text Content */}
                      <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded border border-slate-100 max-h-72 overflow-y-auto leading-relaxed">
                        {activePage.text || '(No text extracted from this page)'}
                      </pre>
                    </div>
                  ) : (
                    <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap bg-white p-3 rounded border border-slate-200 max-h-72 overflow-y-auto">
                      {doc.full_text || '(No full text available)'}
                    </pre>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
