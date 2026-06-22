import { Router } from 'express';
import { RBACController } from '../controllers/rbac.controller';
import { validate } from '../../../middleware/validate';
import { authenticate } from '../../../middleware/auth';
import { authorize } from '../../../middleware/authorize';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { assignRoleSchema } from '../validators/rbac.validator';

const router = Router();
const rbacController = new RBACController();

router.put('/:id/role', authenticate, authorize('user:update'), validate(assignRoleSchema), asyncHandler(rbacController.assignUserRole));

export default router;
