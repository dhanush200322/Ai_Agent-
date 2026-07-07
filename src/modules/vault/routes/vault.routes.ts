import { Router } from 'express';
import { VaultController } from '../controllers/vault.controller';
import { v4 as uuidv4 } from 'uuid';

import { authenticate } from '../../../middleware/auth';
import { authorize } from '../../../middleware/authorize';

const router = Router();
const controller = new VaultController();

router.use(authenticate);

router.post('/', authorize('settings:update'), controller.storeSecret.bind(controller));
router.get('/', authorize('organization:view'), controller.listSecrets.bind(controller));
router.get('/stats', authorize('organization:view'), controller.getStats?.bind(controller) || ((req, res) => res.json({})));
router.get('/:id', authorize('organization:view'), controller.retrieveSecret.bind(controller));
router.post('/:id/rotate', authorize('settings:update'), controller.rotateSecret.bind(controller));
router.delete('/:id', authorize('settings:update'), controller.revokeSecret.bind(controller));

// Leases
router.post('/:id/lease', authorize('settings:update'), controller.createLease.bind(controller));
router.get('/lease/:leaseId', authorize('organization:view'), controller.retrieveLease.bind(controller));

export default router;
