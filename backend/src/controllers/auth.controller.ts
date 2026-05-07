import type { NextFunction, Request, Response } from 'express';
import { registerOrGetUser, mapUserToApi } from '../services/verification.service';
import { createToken } from '../services/token.service';
import { AppError } from '../utils/app-error';
import { sendSuccess } from '../utils/response';
import type { RegisterBody } from '../validators/auth.validator';

export async function register(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    const body = req.validatedBody as RegisterBody | undefined;
    if (!body) {
      throw new AppError('Request body was not validated', 500);
    }

    const user = await registerOrGetUser(body);
    const token = createToken(user);

    return sendSuccess(res, {
      token,
      user: mapUserToApi(user)
    });
  } catch (error) {
    next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    return sendSuccess(res, {
      user: req.user
    });
  } catch (error) {
    next(error);
  }
}
