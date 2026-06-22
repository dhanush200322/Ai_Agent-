import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../../../middleware/validate';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/auth.validator';
import { authenticate } from '../../../middleware/auth';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

const router = Router();
const authController = new AuthController();

router.post('/register', validate(registerSchema), asyncHandler(authController.register));
router.post('/login', validate(loginSchema), asyncHandler(authController.login));
router.post('/refresh', validate(refreshTokenSchema), asyncHandler(authController.refresh));
router.post('/logout', asyncHandler(authController.logout));

// Protected route
router.get('/me', authenticate, asyncHandler(authController.me));

export default router;
