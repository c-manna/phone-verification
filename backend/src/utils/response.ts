import type { Response } from 'express';

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export function sendSuccess<T>(res: Response, payload: T, statusCode = 200): Response {
  return res.status(statusCode).json({
    success: true,
    ...payload
  });
}
