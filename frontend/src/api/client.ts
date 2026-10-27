// MediBridge AI Centralized API Client

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1';

export class ApiError extends Error {
  code: string;
  details?: any;
  requestId?: string;

  constructor(message: string, code: string = 'API_ERROR', details?: any, requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('medibridge_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(
        data?.error?.message || data?.message || `Request failed with status ${response.status}`,
        data?.error?.code || 'HTTP_ERROR',
        data?.error?.details,
        data?.error?.requestId
      );
    }

    return data as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err?.message || 'Network error encountered');
  }
}

