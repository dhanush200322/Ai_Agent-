import { Router } from 'express';
import { RBACController } from '../controllers/rbac.controller';
import { validate } from '../../../middleware/validate';
import { authenticate } from '../../../middleware/auth';
import { authorize } from '../../../middleware/authorize';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { 
  createRoleSchema, 
  updateRoleSchema, 
  assignPermissionSchema
} from '../validators/rbac.validator';

const router = Router();
const rbacController = new RBACController();

// Use authentication middleware globally on this router
router.use(authenticate);

// --- Permissions ---
router.get('/permissions', authorize('permission:view'), asyncHandler(rbacController.getPermissions));

// --- Roles ---
router.get('/', authorize('role:view'), asyncHandler(rbacController.getRoles));
router.post('/', authorize('role:create'), validate(createRoleSchema), asyncHandler(rbacController.createRole));
router.put('/:id', authorize('role:update'), validate(updateRoleSchema), asyncHandler(rbacController.updateRole));
router.delete('/:id', authorize('role:delete'), asyncHandler(rbacController.deleteRole));

// Role-Permissions Management
router.put('/:id/permissions', authorize('permission:update'), validate(assignPermissionSchema), asyncHandler(rbacController.assignPermission));
router.delete('/:id/permissions/:permissionId', authorize('permission:update'), asyncHandler(rbacController.removePermission));

export default router;
