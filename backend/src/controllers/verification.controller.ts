import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/app-error';
import { sendSuccess } from '../utils/response';
import { getUserById, issueVerificationCode, verifyVerificationCode } from '../services/verification.service';
import type { SendCodeBody, VerifyCodeBody } from '../validators/verification.validator';

export async function sendCode(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    const body = req.validatedBody as SendCodeBody | undefined;
    if (!body) {
      throw new AppError('Request body was not validated', 500);
    }

    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const userDoc = await getUserById(req.user.id);

    await issueVerificationCode({
      user: userDoc,
      phone: body.phone
    });

    return sendSuccess(res, {
      message: 'Verification code sent successfully'
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyCode(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    const body = req.validatedBody as VerifyCodeBody | undefined;
    if (!body) {
      throw new AppError('Request body was not validated', 500);
    }

    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const userDoc = await getUserById(req.user.id);

    const updatedUser = await verifyVerificationCode({
      user: userDoc,
      phone: body.phone,
      code: body.code
    });

    return sendSuccess(res, {
      message: 'Phone number verified successfully',
      user: {
        id: updatedUser._id.toString(),
        phone: updatedUser.phone,
        isPhoneVerified: updatedUser.isPhoneVerified
      }
    });
  } catch (error) {
    next(error);
  }
}
