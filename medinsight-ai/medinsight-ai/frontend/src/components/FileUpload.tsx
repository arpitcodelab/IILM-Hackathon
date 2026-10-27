import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, FileUp, AlertCircle, Sparkles, Check } from 'lucide-react';
import { FileList } from './FileList';

const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'txt'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'text/plain',
];
const MAX_FILE_SIZE_BYTES = 30 * 1024 * 1024; // 30MB limit per file

interface FileUploadProps {
  onAnalyze: (files: File[]) => void;
  isLoading?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onAnalyze,
  isLoading = false,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndAddFiles = (incomingFiles: FileList | File[]) => {
    const newErrors: string[] = [];
    const validNewFiles: File[] = [];

    Array.from(incomingFiles).forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      // Check extension / type
      const hasValidExt = ALLOWED_EXTENSIONS.includes(ext);
      const hasValidMime = ALLOWED_MIME_TYPES.includes(file.type) || hasValidExt;

      if (!hasValidExt && !hasValidMime) {
        newErrors.push(`"${file.name}" is not a supported format. Please upload PDF, JPG, PNG, or TXT.`);
        return;
      }

      // Check size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        newErrors.push(`"${file.name}" exceeds the 30MB file size limit.`);
        return;
      }

      // Check for duplicate in current selection
      const isDuplicate = selectedFiles.some(
        (existing) => existing.name === file.name && existing.size === file.size
      );

      if (isDuplicate) {
        newErrors.push(`"${file.name}" is already in the list.`);
        return;
      }

      validNewFiles.push(file);
    });

    setValidationErrors(newErrors);

    if (validNewFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validNewFiles]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
      // Reset input value so re-selecting the same file fires change
      e.target.value = '';
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    setValidationErrors([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyzeClick = () => {
    if (selectedFiles.length === 0 || isLoading) return;
    onAnalyze(selectedFiles);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
      {/* Title & Instructions */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Upload Medical Records
        </h2>
        <p className="mt-1.5 text-sm text-slate-500 max-w-md mx-auto">
          Upload doctor notes, lab panels, discharge summaries, or imaging reports for AI clinical synthesis.
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.txt"
        onChange={handleFileInputChange}
        className="hidden"
        id="medical-file-upload"
        disabled={isLoading}
      />

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !isLoading) {
            fileInputRef.current?.click();
          }
        }}
        className={`group relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-sky-500 bg-sky-50/70 scale-[1.01]'
            : 'border-slate-300 hover:border-sky-400 hover:bg-slate-50/50 bg-slate-50/20'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              isDragOver
                ? 'bg-sky-100 text-sky-600'
                : 'bg-slate-100 text-slate-500 group-hover:bg-sky-50 group-hover:text-sky-600'
            }`}
          >
            <UploadCloud className="w-7 h-7" />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700 group-hover:text-sky-700">
              <span className="text-sky-600 underline underline-offset-2">Click to browse</span> or drag & drop files here
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports PDF, Scanned Images (JPG, PNG), and Plain Text (up to 30MB each)
            </p>
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100/80 text-[11px] text-slate-600 font-medium border border-slate-200">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Multi-document synthesis supported</span>
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs space-y-1">
          <div className="flex items-center font-semibold text-rose-900 gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Document Validation Notice</span>
          </div>
          <ul className="list-disc pl-5 space-y-0.5">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Selected File List */}
      <FileList
        files={selectedFiles}
        onRemove={handleRemoveFile}
        disabled={isLoading}
      />

      {/* Bottom Actions */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
        <div className="text-xs text-slate-400">
          {selectedFiles.length > 0 ? (
            <button
              type="button"
              onClick={handleClearAll}
              disabled={isLoading}
              className="text-slate-500 hover:text-rose-600 underline transition-colors"
            >
              Clear all selected documents
            </button>
          ) : (
            <span>No documents selected yet.</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleAnalyzeClick}
          disabled={selectedFiles.length === 0 || isLoading}
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
        >
          {isLoading ? (
            <>
              <FileUp className="w-4 h-4 mr-2 animate-bounce" />
              <span>Initiating Analysis...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              <span>Analyze Records ({selectedFiles.length})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
