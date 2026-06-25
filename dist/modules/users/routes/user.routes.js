"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../../../middleware/auth");
const authorize_1 = require("../../../middleware/authorize");
const asyncHandler_1 = require("../../../shared/utils/asyncHandler");
const validate_1 = require("../../../middleware/validate");
const storage_service_1 = require("../../../shared/utils/storage.service");
const user_validator_1 = require("../validators/user.validator");
const router = (0, express_1.Router)();
const userController = new user_controller_1.UserController();
// Unprotected invite accept
router.post('/accept-invite', (0, validate_1.validate)(user_validator_1.acceptInviteSchema), (0, asyncHandler_1.asyncHandler)(userController.acceptInvite));
router.use(auth_1.authenticate);
// Profile
router.patch('/profile', storage_service_1.upload.single('avatar'), (0, validate_1.validate)(user_validator_1.updateProfileSchema), (0, asyncHandler_1.asyncHandler)(userController.updateProfile));
// Organization Invites
router.post('/invite', (0, authorize_1.authorize)('user:invite'), (0, validate_1.validate)(user_validator_1.inviteUserSchema), (0, asyncHandler_1.asyncHandler)(userController.inviteUser));
// Users list
router.get('/', (0, authorize_1.authorize)('user:view'), (0, asyncHandler_1.asyncHandler)(userController.getUsers));
router.get('/:id', (0, authorize_1.authorize)('user:view'), (0, asyncHandler_1.asyncHandler)(userController.getUser));
router.patch('/:id/status', (0, authorize_1.authorize)('user:update'), (0, validate_1.validate)(user_validator_1.updateStatusSchema), (0, asyncHandler_1.asyncHandler)(userController.updateStatus));
router.delete('/:id', (0, authorize_1.authorize)('user:delete'), (0, asyncHandler_1.asyncHandler)(userController.deleteUser));
exports.default = router;
