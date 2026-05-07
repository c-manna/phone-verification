import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodTypeAny } from 'zod';
import { AppError } from '../utils/app-error';

export function validateBody(schema: ZodTypeAny): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join(', ');
      return next(new AppError(message, 400, parsed.error.flatten()));
    }

    req.validatedBody = parsed.data;
    return next();
  };
}
