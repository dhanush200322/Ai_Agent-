import { Router } from 'express';
import { BillingController } from '../controllers/billing.controller';
import { authenticate } from '../../../middleware/auth';

const router = Router();
const controller = new BillingController();

router.get('/plans', controller.getPlans.bind(controller));
router.get('/subscription', authenticate, controller.getSubscription.bind(controller));
router.post('/subscribe', authenticate, controller.subscribe.bind(controller));
router.post('/cancel', authenticate, controller.cancel.bind(controller));
router.get('/payment-history', authenticate, controller.getPaymentHistory.bind(controller));
router.post('/renew', authenticate, controller.renew.bind(controller));

// Razorpay routes
router.post('/create-razorpay-order', authenticate, controller.createRazorpayOrder.bind(controller));
router.post('/verify-razorpay-payment', authenticate, controller.verifyRazorpayPayment.bind(controller));
router.post('/razorpay-webhook', controller.razorpayWebhook.bind(controller));


// Webhook must use express.raw({ type: 'application/json' }) in the main app configuration
router.post('/webhook', controller.webhook.bind(controller));

export default router;
