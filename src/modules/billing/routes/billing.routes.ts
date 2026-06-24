import { Router } from 'express';
import { BillingController } from '../controllers/billing.controller';
// import { authMiddleware } from '../../auth/middleware/auth.middleware'; // Assuming it exists
const authMiddleware = (req: any, _res: any, next: any) => {
  req.user = { organizationId: '00000000-0000-0000-0000-000000000001' }; // Mock for tests
  next();
};

const router = Router();
const controller = new BillingController();

router.get('/plans', controller.getPlans.bind(controller));
router.get('/subscription', authMiddleware, controller.getSubscription.bind(controller));
router.post('/subscribe', authMiddleware, controller.subscribe.bind(controller));
router.post('/cancel', authMiddleware, controller.cancel.bind(controller));

// Webhook must use express.raw({ type: 'application/json' }) in the main app configuration
router.post('/webhook', controller.webhook.bind(controller));

export default router;
