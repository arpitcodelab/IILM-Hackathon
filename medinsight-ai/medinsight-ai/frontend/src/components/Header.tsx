import React from 'react';
import { Activity, Shield } from 'lucide-react';

interface HeaderProps {
  onReset?: () => void;
  showNewAnalysis?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onReset, showNewAnalysis = false }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & App Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onReset} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') onReset?.(); }}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-sky-600/20">
              <Activity className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  MedInsight <span className="text-sky-600">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
                  Clinical RAG
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                AI-Powered Medical Record Analysis
              </p>
            </div>
          </div>

          {/* Right Header Navigation & Actions */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>HIPAA Compliant Processing · Zero Data Retention</span>
            </div>

            {showNewAnalysis && onReset && (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center px-3.5 py-1.5 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors shadow-2xs"
              >
                + New Analysis
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
