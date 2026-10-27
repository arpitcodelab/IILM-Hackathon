import React from 'react';
import { FileText, FileImage, FileCode, Trash2, CheckCircle2 } from 'lucide-react';

interface FileListProps {
  files: File[];
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return <FileText className="w-5 h-5 text-rose-500" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
      return <FileImage className="w-5 h-5 text-blue-500" />;
    case 'txt':
      return <FileCode className="w-5 h-5 text-amber-500" />;
    default:
      return <FileText className="w-5 h-5 text-slate-500" />;
  }
};

export const FileList: React.FC<FileListProps> = ({
  files,
  onRemove,
  disabled = false,
}) => {
  if (files.length === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between text-xs font-medium text-slate-500 px-1">
        <span>Selected Documents ({files.length})</span>
        <span>
          Total Size:{' '}
          {formatFileSize(files.reduce((acc, f) => acc + f.size, 0))}
        </span>
      </div>

      <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white overflow-hidden shadow-2xs">
        {files.map((file, idx) => (
          <li
            key={`${file.name}-${file.size}-${idx}`}
            className="flex items-center justify-between px-3.5 py-2.5 hover:bg-slate-50/80 transition-colors"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="shrink-0 p-1.5 bg-slate-50 rounded-md border border-slate-200">
                {getFileIcon(file.name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate max-w-xs sm:max-w-md">
                  {file.name}
                </p>
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <span>{formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span className="uppercase text-[10px] tracking-wider font-semibold text-slate-500">
                    {file.name.split('.').pop() || 'FILE'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center text-emerald-600">
                    <CheckCircle2 className="w-3 h-3 mr-0.5" /> Ready
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onRemove(idx)}
              disabled={disabled}
              className="ml-3 shrink-0 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-rose-500"
              title={`Remove ${file.name}`}
              aria-label={`Remove ${file.name}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
