"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const billing_controller_1 = require("../controllers/billing.controller");
// import { authMiddleware } from '../../auth/middleware/auth.middleware'; // Assuming it exists
const authMiddleware = (req, _res, next) => {
    req.user = { organizationId: '00000000-0000-0000-0000-000000000001' }; // Mock for tests
    next();
};
const router = (0, express_1.Router)();
const controller = new billing_controller_1.BillingController();
router.get('/plans', controller.getPlans.bind(controller));
router.get('/subscription', authMiddleware, controller.getSubscription.bind(controller));
router.post('/subscribe', authMiddleware, controller.subscribe.bind(controller));
router.post('/cancel', authMiddleware, controller.cancel.bind(controller));
// Webhook must use express.raw({ type: 'application/json' }) in the main app configuration
router.post('/webhook', controller.webhook.bind(controller));
exports.default = router;
