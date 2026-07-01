import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../../../middleware/validate';
import { loginSchema, refreshTokenSchema, registerSchema } from '../validators/auth.validator';
import { authenticate } from '../../../middleware/auth';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

const router = Router();
const authController = new AuthController();

// Public auth routes
router.post('/register', validate(registerSchema), asyncHandler(authController.register));
router.post('/login', validate(loginSchema), asyncHandler(authController.login));
router.post('/refresh', validate(refreshTokenSchema), asyncHandler(authController.refresh));
router.post('/password/reset', asyncHandler(authController.passwordReset));
router.get('/oauth/google', asyncHandler(authController.oauthGoogle));
router.get('/oauth/google/callback', asyncHandler(authController.oauthGoogleCallback));
router.get('/oauth/github', asyncHandler(authController.oauthGithub));
router.get('/oauth/github/callback', asyncHandler(authController.oauthGithubCallback));
router.post('/mfa/verify', asyncHandler(authController.mfaVerify));

// Protected auth routes
router.get('/me', authenticate, asyncHandler(authController.me));
router.post('/logout', authenticate, asyncHandler(authController.logout));
router.post('/password/change', authenticate, asyncHandler(authController.passwordChange));
router.post('/mfa/setup', authenticate, asyncHandler(authController.mfaSetup));
router.post('/mfa/disable', authenticate, asyncHandler(authController.mfaDisable));
router.get('/sessions', authenticate, asyncHandler(authController.getSessions));
router.delete('/sessions/:id', authenticate, asyncHandler(authController.revokeSession));
router.delete('/sessions', authenticate, asyncHandler(authController.revokeAllSessions));

export default router;
