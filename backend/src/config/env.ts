import 'dotenv/config';
import type { SignOptions } from 'jsonwebtoken';

function envNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  port: envNumber(process.env.PORT, 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN || '1d') as SignOptions['expiresIn'],
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  otpExpiryMinutes: envNumber(process.env.OTP_EXPIRY_MINUTES, 2),
  otpResendCooldownSeconds: envNumber(process.env.OTP_RESEND_COOLDOWN_SECONDS, 30),
  otpMaxAttempts: envNumber(process.env.OTP_MAX_ATTEMPTS, 5),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
};
