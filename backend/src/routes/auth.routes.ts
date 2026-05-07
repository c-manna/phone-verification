import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { registerSchema } from '../validators/auth.validator';
import { me, register } from '../controllers/auth.controller';

const router = Router();

router.post('/register', validateBody(registerSchema), asyncHandler(register));
router.get('/me', authMiddleware, asyncHandler(me));

export default router;
