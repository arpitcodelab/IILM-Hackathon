import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ReportSectionProps {
  id: string;
  sectionNumber: number;
  title: string;
  icon?: React.ReactNode;
  badge?: string | number | null;
  badgeVariant?: 'default' | 'warning' | 'urgent' | 'success' | 'info';
  children: React.ReactNode;
  isInitiallyExpanded?: boolean;
  forceExpanded?: boolean | null; // For global expand/collapse all
}

export const ReportSection: React.FC<ReportSectionProps> = ({
  id,
  sectionNumber,
  title,
  icon,
  badge,
  badgeVariant = 'default',
  children,
  isInitiallyExpanded = true,
  forceExpanded = null,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(isInitiallyExpanded);

  useEffect(() => {
    if (forceExpanded !== null) {
      setIsExpanded(forceExpanded);
    }
  }, [forceExpanded]);

  const getBadgeClass = () => {
    switch (badgeVariant) {
      case 'urgent':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'warning':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'success':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'info':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <section
      id={id}
      className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-200 mb-5 scroll-mt-24"
    >
      {/* Section Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left px-5 py-4 flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition-colors focus:outline-none focus:bg-slate-100/60"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center space-x-3.5 min-w-0">
          <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
            {sectionNumber}
          </span>

          {icon && <span className="text-slate-500 shrink-0">{icon}</span>}

          <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
            {title}
          </h3>

          {badge !== undefined && badge !== null && (
            <span
              className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getBadgeClass()}`}
            >
              {badge}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 shrink-0 ml-2">
          {badge !== undefined && badge !== null && (
            <span
              className={`sm:hidden inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getBadgeClass()}`}
            >
              {badge}
            </span>
          )}
          <div className="p-1 rounded-md text-slate-400 hover:text-slate-600">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </div>
        </div>
      </button>

      {/* Section Body */}
      {isExpanded && (
        <div className="px-5 py-5 border-t border-slate-100 text-slate-700 leading-relaxed">
          {children}
        </div>
      )}
    </section>
  );
};
