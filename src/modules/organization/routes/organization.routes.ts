import { Router } from 'express';
import { OrganizationController } from '../controllers/organization.controller';
import { authenticate } from '../../../middleware/auth';
import { authorize } from '../../../middleware/authorize';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { validate } from '../../../middleware/validate';
import { updateOrganizationSchema, transferOwnershipSchema } from '../validators/organization.validator';

const router = Router();
const orgController = new OrganizationController();

router.use(authenticate);

router.get('/', authorize('organization:view'), asyncHandler(orgController.getOrganization));
router.patch('/', authorize('organization:update'), validate(updateOrganizationSchema), asyncHandler(orgController.updateOrganization));
router.get('/stats', authorize('organization:view'), asyncHandler(orgController.getStats));
router.post('/transfer-ownership', authorize('organization:update'), validate(transferOwnershipSchema), asyncHandler(orgController.transferOwnership));

export default router;
