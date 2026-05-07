import type { NextFunction, Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { verifyToken } from '../services/token.service';
import { AppError } from '../utils/app-error';

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!token) {
      throw new AppError('Authorization token is required', 401);
    }

    const payload = verifyToken(token);
    const user = await UserModel.findById(payload.sub).lean();

    if (!user) {
      throw new AppError('Authorized user not found', 401);
    }

    req.auth = payload;
    req.user = {
      id: user._id.toString(),
      name: user.name,
      phone: user.phone,
      isPhoneVerified: user.isPhoneVerified
    };

    next();
  } catch (error) {
    next(error);
  }
}
