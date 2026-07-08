"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const billing_controller_1 = require("../controllers/billing.controller");
const auth_1 = require("../../../middleware/auth");
const router = (0, express_1.Router)();
const controller = new billing_controller_1.BillingController();
router.get('/plans', controller.getPlans.bind(controller));
router.get('/subscription', auth_1.authenticate, controller.getSubscription.bind(controller));
router.post('/subscribe', auth_1.authenticate, controller.subscribe.bind(controller));
router.post('/cancel', auth_1.authenticate, controller.cancel.bind(controller));
router.get('/payment-history', auth_1.authenticate, controller.getPaymentHistory.bind(controller));
router.post('/renew', auth_1.authenticate, controller.renew.bind(controller));
// Razorpay routes
router.post('/create-razorpay-order', auth_1.authenticate, controller.createRazorpayOrder.bind(controller));
router.post('/verify-razorpay-payment', auth_1.authenticate, controller.verifyRazorpayPayment.bind(controller));
router.post('/razorpay-webhook', controller.razorpayWebhook.bind(controller));
// Webhook must use express.raw({ type: 'application/json' }) in the main app configuration
router.post('/webhook', controller.webhook.bind(controller));
exports.default = router;
