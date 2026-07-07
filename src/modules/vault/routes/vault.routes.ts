import { Router } from 'express';
import { VaultController } from '../controllers/vault.controller';
import { v4 as uuidv4 } from 'uuid';

import { authenticate } from '../../../middleware/auth';
import { authorize } from '../../../middleware/authorize';

const router = Router();
const controller = new VaultController();

router.use(authenticate);

router.post('/', authorize('vault:write'), controller.storeSecret.bind(controller));
router.get('/', authorize('vault:view'), controller.listSecrets.bind(controller));
router.get('/stats', authorize('vault:view'), controller.getStats?.bind(controller) || ((req, res) => res.json({})));
router.get('/:id', authorize('vault:view'), controller.retrieveSecret.bind(controller));
router.post('/:id/rotate', authorize('vault:write'), controller.rotateSecret.bind(controller));
router.delete('/:id', authorize('vault:write'), controller.revokeSecret.bind(controller));

// Leases
router.post('/:id/lease', authorize('vault:write'), controller.createLease.bind(controller));
router.get('/lease/:leaseId', authorize('vault:view'), controller.retrieveLease.bind(controller));

export default router;
