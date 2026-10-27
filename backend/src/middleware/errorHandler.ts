import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected error occurred';

  // Redact stack traces in non-test production
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[ERROR] ${req.method} ${req.path} - ${code}: ${message}`);
  }

  res.status(statusCode).json({
    error: {
      code,
      message,
      details: err.details || null,
      requestId: (req as any).id || `req_${Date.now()}`,
    },
  });
}

