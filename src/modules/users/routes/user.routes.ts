import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../../../middleware/auth';
import { authorize } from '../../../middleware/authorize';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { validate } from '../../../middleware/validate';
import { upload } from '../../../shared/utils/storage.service';
import { inviteUserSchema, acceptInviteSchema, updateStatusSchema, updateProfileSchema } from '../validators/user.validator';

const router = Router();
const userController = new UserController();

// Unprotected invite accept
router.post('/accept-invite', validate(acceptInviteSchema), asyncHandler(userController.acceptInvite));

router.use(authenticate);

// Profile
router.patch('/profile', upload.single('avatar'), validate(updateProfileSchema), asyncHandler(userController.updateProfile));

// Organization Invites
router.post('/invite', authorize('user:create'), validate(inviteUserSchema), asyncHandler(userController.inviteUser));

// Users list
router.get('/', asyncHandler(userController.getUsers));
router.get('/:id', asyncHandler(userController.getUser));
router.patch('/:id/status', authorize('user:update'), validate(updateStatusSchema), asyncHandler(userController.updateStatus));
router.delete('/:id', authorize('user:delete'), asyncHandler(userController.deleteUser));

export default router;
