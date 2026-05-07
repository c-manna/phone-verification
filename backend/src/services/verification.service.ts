import { Types } from 'mongoose';
import { env } from '../config/env';
import { UserModel, type UserDocument } from '../models/user.model';
import { VerificationCodeModel } from '../models/verification.model';
import type { AuthenticatedUser } from '../types/jwt-payload.type';
import { AppError } from '../utils/app-error';
import { compareOtp, generateOtp, hashOtp } from '../utils/otp';
import { sendVerificationSms } from './sms.service';

export function mapUserToApi(user: UserDocument): AuthenticatedUser {
  return {
    id: user._id.toString(),
    name: user.name,
    phone: user.phone,
    isPhoneVerified: user.isPhoneVerified
  };
}

export async function registerOrGetUser(params: { name: string; phone: string }): Promise<UserDocument> {
  const { name, phone } = params;
  const existing = await UserModel.findOne({ phone });

  if (existing) {
    return existing;
  }

  return UserModel.create({ name, phone });
}

export async function getUserById(userId: string): Promise<UserDocument> {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}

export async function issueVerificationCode(params: {
  user: UserDocument;
  phone: string;
}): Promise<void> {
  const { user, phone } = params;

  if (user.phone !== phone) {
    throw new AppError('Phone number does not match the authenticated user', 403);
  }

  const now = new Date();
  const cooldownBoundary = new Date(now.getTime() - env.otpResendCooldownSeconds * 1000);

  // Reuse the newest unused code only after the resend cooldown window closes.
  const latestUnused = await VerificationCodeModel.findOne({
    phone,
    used: false
  }).sort({ createdAt: -1 });

  if (
    latestUnused &&
    latestUnused.createdAt &&
    latestUnused.createdAt.getTime() >= cooldownBoundary.getTime()
  ) {
    throw new AppError(
      `Please wait ${env.otpResendCooldownSeconds} seconds before requesting another code`,
      429
    );
  }

  const code = generateOtp();
  const codeHash = await hashOtp(code);
  const expiresAt = new Date(now.getTime() + env.otpExpiryMinutes * 60 * 1000);

  await VerificationCodeModel.create({
    userId: new Types.ObjectId(user._id),
    phone,
    codeHash,
    expiresAt,
    used: false,
    attempts: 0
  });

  await sendVerificationSms(phone, code);
}

export async function verifyVerificationCode(params: {
  user: UserDocument;
  phone: string;
  code: string;
}): Promise<UserDocument> {
  const { user, phone, code } = params;

  if (user.phone !== phone) {
    throw new AppError('Phone number does not match the authenticated user', 403);
  }

  const verification = await VerificationCodeModel.findOne({
    phone,
    used: false
  }).sort({ createdAt: -1 });

  if (!verification) {
    throw new AppError('No active verification code found', 404);
  }

  // Expired codes are marked used so they cannot be retried later.
  if (verification.expiresAt.getTime() < Date.now()) {
    verification.used = true;
    await verification.save();
    throw new AppError('Verification code has expired', 410);
  }

  if (verification.attempts >= env.otpMaxAttempts) {
    verification.used = true;
    await verification.save();
    throw new AppError('Maximum verification attempts exceeded', 429);
  }

  const matches = await compareOtp(code, verification.codeHash);
  if (!matches) {
    verification.attempts += 1;

    if (verification.attempts >= env.otpMaxAttempts) {
      verification.used = true;
      await verification.save();
      throw new AppError('Maximum verification attempts exceeded', 429);
    }

    await verification.save();
    throw new AppError('Invalid verification code', 400);
  }

  verification.used = true;
  await verification.save();

  const updatedUser = await UserModel.findByIdAndUpdate(
    user._id,
    { isPhoneVerified: true },
    { new: true }
  );

  if (!updatedUser) {
    throw new AppError('User not found', 404);
  }

  return updatedUser;
}
