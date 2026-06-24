import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../../../middleware/validate';
import { loginSchema, refreshTokenSchema } from '../validators/auth.validator';
import { authenticate } from '../../../middleware/auth';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

const router = Router();
const authController = new AuthController();

// Public auth routes
router.post('/login', validate(loginSchema), asyncHandler(authController.login));
router.post('/refresh', validate(refreshTokenSchema), asyncHandler(authController.refresh));
router.post('/password/reset', asyncHandler(authController.passwordReset));
router.post('/oauth/google', asyncHandler(authController.oauthGoogle));
router.post('/oauth/microsoft', asyncHandler(authController.oauthMicrosoft));
router.post('/mfa/verify', asyncHandler(authController.mfaVerify));

// Protected auth routes
router.post('/logout', authenticate, asyncHandler(authController.logout));
router.post('/password/change', authenticate, asyncHandler(authController.passwordChange));
router.post('/mfa/setup', authenticate, asyncHandler(authController.mfaSetup));
router.post('/mfa/disable', authenticate, asyncHandler(authController.mfaDisable));
router.get('/sessions', authenticate, asyncHandler(authController.getSessions));
router.delete('/sessions/:id', authenticate, asyncHandler(authController.revokeSession));
router.delete('/sessions', authenticate, asyncHandler(authController.revokeAllSessions));

export default router;
