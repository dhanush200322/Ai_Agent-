"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validate_1 = require("../../../middleware/validate");
const auth_validator_1 = require("../validators/auth.validator");
const auth_1 = require("../../../middleware/auth");
const asyncHandler_1 = require("../../../shared/utils/asyncHandler");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
// Public auth routes
router.post('/login', (0, validate_1.validate)(auth_validator_1.loginSchema), (0, asyncHandler_1.asyncHandler)(authController.login));
router.post('/refresh', (0, validate_1.validate)(auth_validator_1.refreshTokenSchema), (0, asyncHandler_1.asyncHandler)(authController.refresh));
router.post('/password/reset', (0, asyncHandler_1.asyncHandler)(authController.passwordReset));
router.post('/oauth/google', (0, asyncHandler_1.asyncHandler)(authController.oauthGoogle));
router.post('/oauth/microsoft', (0, asyncHandler_1.asyncHandler)(authController.oauthMicrosoft));
router.post('/mfa/verify', (0, asyncHandler_1.asyncHandler)(authController.mfaVerify));
// Protected auth routes
router.post('/logout', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(authController.logout));
router.post('/password/change', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(authController.passwordChange));
router.post('/mfa/setup', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(authController.mfaSetup));
router.post('/mfa/disable', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(authController.mfaDisable));
router.get('/sessions', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(authController.getSessions));
router.delete('/sessions/:id', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(authController.revokeSession));
router.delete('/sessions', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(authController.revokeAllSessions));
exports.default = router;
