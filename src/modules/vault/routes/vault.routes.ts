import { Router } from 'express';
import { VaultController } from '../controllers/vault.controller';
import { v4 as uuidv4 } from 'uuid';

// Mock auth middleware for the prototype
const authMiddleware = (req: any, _res: any, next: any) => {
  req.user = { 
    id: uuidv4(),
    organizationId: '00000000-0000-0000-0000-000000000001' 
  };
  next();
};

const router = Router();
const controller = new VaultController();

router.post('/', authMiddleware, controller.storeSecret.bind(controller));
router.get('/', authMiddleware, controller.listSecrets.bind(controller));
router.get('/:id', authMiddleware, controller.retrieveSecret.bind(controller));
router.post('/:id/rotate', authMiddleware, controller.rotateSecret.bind(controller));
router.delete('/:id', authMiddleware, controller.revokeSecret.bind(controller));

// Leases
router.post('/:id/lease', authMiddleware, controller.createLease.bind(controller));
router.get('/lease/:leaseId', authMiddleware, controller.retrieveLease.bind(controller));

export default router;
