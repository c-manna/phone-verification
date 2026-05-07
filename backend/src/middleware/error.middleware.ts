import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/app-error';

export function notFound(req: Request, res: Response, next: NextFunction): void {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

export function errorHandler(error: unknown, req: Request, res: Response, next: NextFunction): Response {
  const appError = error instanceof AppError ? error : undefined;
  const statusCode = appError?.statusCode ?? 500;
  const message = error instanceof Error ? error.message : 'Internal server error';

  if (statusCode >= 500) {
    console.error(error);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(appError?.details ? { details: appError.details } : {}),
    ...(process.env.NODE_ENV !== 'production' && error instanceof Error && error.stack
      ? { stack: error.stack }
      : {})
  });
}
