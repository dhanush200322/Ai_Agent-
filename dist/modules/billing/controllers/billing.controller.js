"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingController = void 0;
const prisma_1 = require("../../../shared/prisma");
const subscription_engine_1 = require("../engine/subscription.engine");
const stripe_provider_1 = require("../providers/stripe.provider");
const queue_manager_1 = require("../../queue/engine/queue-manager");
const bullmq_provider_1 = require("../../queue/providers/bullmq.provider");
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
class BillingController {
    subscriptionEngine = new subscription_engine_1.SubscriptionEngine();
    stripeProvider = new stripe_provider_1.StripeProvider();
    queueManager = new queue_manager_1.QueueManager(new bullmq_provider_1.BullMQProvider());
    async getPlans(_req, res) {
        const plans = await prisma_1.prisma.subscriptionPlan.findMany({ where: { active: true } });
        res.json(plans);
    }
    async getSubscription(req, res) {
        const organizationId = req.user.organizationId;
        const sub = await prisma_1.prisma.organizationSubscription.findUnique({
            where: { organizationId },
            include: { plan: true }
        });
        res.json(sub);
    }
    async subscribe(req, res) {
        const organizationId = req.user.organizationId;
        const { planId } = req.body;
        try {
            const sub = await this.subscriptionEngine.subscribe(organizationId, planId);
            res.json(sub);
        }
        catch (e) {
            res.status(400).json({ error: e.message });
        }
    }
    async cancel(req, res) {
        const organizationId = req.user.organizationId;
        const sub = await this.subscriptionEngine.cancel(organizationId);
        res.json(sub);
    }
    // --- Razorpay Integration ---
    async createRazorpayOrder(req, res) {
        const organizationId = req.user.organizationId;
        const { plan, billingCycle } = req.body;
        try {
            let amountInINR = 0;
            if (plan === 'professional') {
                amountInINR = billingCycle === 'annual' ? 9990 : 999;
            }
            else {
                res.status(400).json({ error: 'Invalid plan selected.' });
                return;
            }
            const amountInPaise = amountInINR * 100;
            const razorpay = new razorpay_1.default({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET
            });
            const orderOptions = {
                amount: amountInPaise,
                currency: 'INR',
                receipt: `rcpt_${organizationId.substring(0, 8)}_${Date.now()}`
            };
            const order = await razorpay.orders.create(orderOptions);
            res.json({
                order_id: order.id,
                amount: order.amount,
                currency: order.currency
            });
        }
        catch (error) {
            console.error('Error creating Razorpay order:', error);
            res.status(500).json({ error: 'Failed to create payment order.' });
        }
    }
    async verifyRazorpayPayment(req, res) {
        const organizationId = req.user.organizationId;
        const userId = req.user.id;
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, plan, billingCycle } = req.body;
        try {
            const secret = process.env.RAZORPAY_KEY_SECRET;
            const generatedSignature = crypto_1.default
                .createHmac('sha256', secret)
                .update(razorpay_order_id + '|' + razorpay_payment_id)
                .digest('hex');
            if (generatedSignature !== razorpay_signature) {
                res.status(400).json({ error: 'Invalid payment signature.' });
                return;
            }
            const existingPayment = await prisma_1.prisma.payment.findUnique({
                where: { providerPaymentId: razorpay_payment_id }
            });
            if (existingPayment) {
                res.status(400).json({ error: 'Duplicate payment.' });
                return;
            }
            const subscriptionPlan = await prisma_1.prisma.subscriptionPlan.findFirst({
                where: { name: { equals: plan, mode: 'insensitive' } }
            });
            if (!subscriptionPlan) {
                res.status(400).json({ error: 'Plan not found.' });
                return;
            }
            const planId = subscriptionPlan.id;
            let amountInINR = plan === 'professional' ? (billingCycle === 'annual' ? 9990 : 999) : 0;
            const orgSub = await prisma_1.prisma.$transaction(async (tx) => {
                const renewalDate = billingCycle === 'annual'
                    ? new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                    : new Date(new Date().setMonth(new Date().getMonth() + 1));
                const sub = await tx.organizationSubscription.upsert({
                    where: { organizationId },
                    update: {
                        userId: userId,
                        status: 'ACTIVE',
                        billingCycle: billingCycle,
                        paymentProvider: 'RAZORPAY',
                        startDate: new Date(),
                        renewalDate: renewalDate,
                        expiryDate: renewalDate,
                        razorpayOrderId: razorpay_order_id,
                        razorpayPaymentId: razorpay_payment_id,
                        razorpaySignature: razorpay_signature,
                        amount: amountInINR,
                        currency: 'INR'
                    },
                    create: {
                        userId: userId,
                        organizationId,
                        planId: planId,
                        billingCycle: billingCycle,
                        status: 'ACTIVE',
                        paymentProvider: 'RAZORPAY',
                        startDate: new Date(),
                        renewalDate: renewalDate,
                        expiryDate: renewalDate,
                        razorpayOrderId: razorpay_order_id,
                        razorpayPaymentId: razorpay_payment_id,
                        razorpaySignature: razorpay_signature,
                        amount: amountInINR,
                        currency: 'INR'
                    }
                });
                const invoice = await tx.invoice.create({
                    data: {
                        organizationId,
                        invoiceNumber: `INV-${Date.now()}`,
                        subtotal: amountInINR,
                        tax: 0,
                        total: amountInINR,
                        status: 'PAID',
                        paidAt: new Date()
                    }
                });
                await tx.payment.create({
                    data: {
                        invoiceId: invoice.id,
                        provider: 'RAZORPAY',
                        providerPaymentId: razorpay_payment_id,
                        currency: 'INR',
                        amount: amountInINR,
                        status: 'COMPLETED',
                        orderId: razorpay_order_id,
                        paymentMethod: 'razorpay',
                        purchaseDate: new Date()
                    }
                });
                return sub;
            });
            res.json({ success: true, subscription: orgSub });
        }
        catch (error) {
            console.error('Error verifying Razorpay payment:', error);
            res.status(500).json({ error: 'Failed to verify payment.' });
        }
    }
    // --- End Razorpay Integration ---
    async getPaymentHistory(req, res) {
        const organizationId = req.user.organizationId;
        try {
            const payments = await prisma_1.prisma.payment.findMany({
                where: { invoice: { organizationId } },
                include: { invoice: true },
                orderBy: { purchaseDate: 'desc' }
            });
            res.json(payments);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch payment history' });
        }
    }
    async renew(req, res) {
        res.json({ success: true, message: 'Use create-razorpay-order to renew' });
    }
    async razorpayWebhook(req, res) {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
        const signature = req.headers['x-razorpay-signature'];
        try {
            const generatedSignature = crypto_1.default
                .createHmac('sha256', secret)
                .update(JSON.stringify(req.body))
                .digest('hex');
            if (generatedSignature !== signature) {
                res.status(400).json({ error: 'Invalid webhook signature' });
                return;
            }
            const event = req.body;
            const webhookEvent = await prisma_1.prisma.billingWebhookEvent.create({
                data: {
                    provider: 'RAZORPAY',
                    providerEventId: event.id || `evt_${Date.now()}`,
                    eventType: event.event || 'unknown',
                    payload: JSON.stringify(event)
                }
            });
            res.status(200).send('OK');
        }
        catch (err) {
            res.status(400).send(`Webhook Error: ${err.message}`);
        }
    }
    async webhook(req, res) {
        const signature = req.headers['stripe-signature'];
        const rawBody = req.rawBody;
        try {
            const event = this.stripeProvider.verifyWebhook(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_123');
            const webhookEvent = await prisma_1.prisma.billingWebhookEvent.create({
                data: {
                    provider: 'STRIPE',
                    providerEventId: event.id,
                    eventType: event.type,
                    payload: JSON.stringify(event)
                }
            });
            await this.queueManager.enqueue({
                queueName: 'billing.webhooks',
                type: 'WEBHOOK',
                payload: {
                    id: webhookEvent.id,
                    organizationId: 'SYSTEM',
                    correlationId: webhookEvent.id,
                    traceId: webhookEvent.id,
                    priority: 'HIGH',
                    retries: 3,
                    payload: { webhookEventId: webhookEvent.id },
                    metadata: {},
                    createdAt: new Date()
                },
                priority: 'HIGH'
            });
            res.status(200).send('OK');
        }
        catch (err) {
            res.status(400).send(`Webhook Error: ${err.message}`);
        }
    }
}
exports.BillingController = BillingController;
