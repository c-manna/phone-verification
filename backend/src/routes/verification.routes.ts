import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../utils/asyncHandler';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { sendCodeSchema, verifyCodeSchema } from '../validators/verification.validator';
import { sendCode, verifyCode } from '../controllers/verification.controller';

const otpRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP requests. Please slow down and try again.'
  }
});

const router = Router();

router.post('/send-code', authMiddleware, otpRateLimit, validateBody(sendCodeSchema), asyncHandler(sendCode));
router.post('/verify-code', authMiddleware, otpRateLimit, validateBody(verifyCodeSchema), asyncHandler(verifyCode));

export default router;
