"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rbac_controller_1 = require("../controllers/rbac.controller");
const validate_1 = require("../../../middleware/validate");
const auth_1 = require("../../../middleware/auth");
const authorize_1 = require("../../../middleware/authorize");
const asyncHandler_1 = require("../../../shared/utils/asyncHandler");
const rbac_validator_1 = require("../validators/rbac.validator");
const router = (0, express_1.Router)();
const rbacController = new rbac_controller_1.RBACController();
// Use authentication middleware globally on this router
router.use(auth_1.authenticate);
// --- Permissions ---
router.get('/permissions', (0, authorize_1.authorize)('permission:view'), (0, asyncHandler_1.asyncHandler)(rbacController.getPermissions));
// --- Roles ---
router.get('/', (0, authorize_1.authorize)('role:view'), (0, asyncHandler_1.asyncHandler)(rbacController.getRoles));
router.post('/', (0, authorize_1.authorize)('role:create'), (0, validate_1.validate)(rbac_validator_1.createRoleSchema), (0, asyncHandler_1.asyncHandler)(rbacController.createRole));
router.put('/:id', (0, authorize_1.authorize)('role:update'), (0, validate_1.validate)(rbac_validator_1.updateRoleSchema), (0, asyncHandler_1.asyncHandler)(rbacController.updateRole));
router.delete('/:id', (0, authorize_1.authorize)('role:delete'), (0, asyncHandler_1.asyncHandler)(rbacController.deleteRole));
// Role-Permissions Management
router.put('/:id/permissions', (0, authorize_1.authorize)('permission:update'), (0, validate_1.validate)(rbac_validator_1.assignPermissionSchema), (0, asyncHandler_1.asyncHandler)(rbacController.assignPermission));
router.delete('/:id/permissions/:permissionId', (0, authorize_1.authorize)('permission:update'), (0, asyncHandler_1.asyncHandler)(rbacController.removePermission));
exports.default = router;
