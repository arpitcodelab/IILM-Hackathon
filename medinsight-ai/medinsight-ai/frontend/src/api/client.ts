/**
 * MedInsight AI - API Client
 * Uses native fetch to interact with the FastAPI backend.
 */

import {
  AnalysisStatusResponse,
  MedicalReport,
  ExtractionPreview,
  HealthResponse,
} from '../types';

const API_BASE_URL = '/api';

export class ApiError extends Error {
  status: number;
  detail?: string;

  constructor(message: string, status: number, detail?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.error || JSON.stringify(errJson);
    } catch {
      errorDetail = await response.text();
    }
    throw new ApiError(
      errorDetail || `HTTP error ${response.status}: ${response.statusText}`,
      response.status,
      errorDetail
    );
  }
  return response.json() as Promise<T>;
}

/**
 * Check backend health status.
 */
export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`, {
    headers: { Accept: 'application/json' },
  });
  return handleResponse<HealthResponse>(response);
}

/**
 * Submit files for analysis.
 * Sends multipart/form-data with one or multiple files.
 */
export async function submitAnalysis(files: File[]): Promise<{ analysis_id: string; message?: string }> {
  if (!files || files.length === 0) {
    throw new Error('At least one file must be selected for analysis.');
  }

  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file, file.name);
  }

  const response = await fetch(`${API_BASE_URL}/analysis`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse<{ analysis_id: string; message?: string }>(response);
}

/**
 * Poll current status of an analysis job.
 */
export async function getAnalysisStatus(id: string): Promise<AnalysisStatusResponse> {
  if (!id) throw new Error('Analysis ID is required');

  const response = await fetch(`${API_BASE_URL}/analysis/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  return handleResponse<AnalysisStatusResponse>(response);
}

/**
 * Fetch the complete 16-section medical report for a completed analysis.
 */
export async function getReport(id: string): Promise<MedicalReport> {
  if (!id) throw new Error('Analysis ID is required');

  const response = await fetch(`${API_BASE_URL}/analysis/${encodeURIComponent(id)}/report`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  return handleResponse<MedicalReport>(response);
}

/**
 * Fetch OCR/Text extraction preview for an analysis job.
 */
export async function getExtractionPreview(id: string): Promise<ExtractionPreview> {
  if (!id) throw new Error('Analysis ID is required');

  const response = await fetch(`${API_BASE_URL}/analysis/${encodeURIComponent(id)}/preview`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  return handleResponse<ExtractionPreview>(response);
}

/**
 * Download the generated PDF report from backend.
 * Triggers native browser file download.
 */
export async function downloadReportPdf(id: string, filename = 'MedInsight_Analysis_Report.pdf'): Promise<void> {
  if (!id) throw new Error('Analysis ID is required');

  const response = await fetch(`${API_BASE_URL}/analysis/${encodeURIComponent(id)}/report.pdf`, {
    method: 'GET',
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const err = await response.json();
      errorDetail = err.detail || err.error;
    } catch {
      errorDetail = response.statusText;
    }
    throw new ApiError(`Failed to download PDF: ${errorDetail}`, response.status, errorDetail);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * Download the generated HTML report from backend.
 */
export async function downloadReportHtml(id: string, filename = 'MedInsight_Analysis_Report.html'): Promise<void> {
  if (!id) throw new Error('Analysis ID is required');

  const response = await fetch(`${API_BASE_URL}/analysis/${encodeURIComponent(id)}/report.html`, {
    method: 'GET',
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const err = await response.json();
      errorDetail = err.detail || err.error;
    } catch {
      errorDetail = response.statusText;
    }
    throw new ApiError(`Failed to download HTML: ${errorDetail}`, response.status, errorDetail);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
