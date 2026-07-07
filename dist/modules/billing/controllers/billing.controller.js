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
        const { plan, billingCycle } = req.body; // e.g. plan: "professional", billingCycle: "monthly"
        try {
            // Determine amount based on plan and billingCycle
            let amountInINR = 0;
            if (plan === 'professional') {
                amountInINR = billingCycle === 'annual' ? 9990 : 999;
            }
            else {
                return res.status(400).json({ error: 'Invalid plan selected.' });
            }
            // Razorpay expects amount in paise (1 INR = 100 paise)
            const amountInPaise = amountInINR * 100;
            const razorpay = new razorpay_1.default({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET
            });
            const orderOptions = {
                amount: amountInPaise,
                currency: 'INR',
                receipt: `receipt_org_${organizationId}_${Date.now()}`
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
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, plan, billingCycle } = req.body;
        try {
            const secret = process.env.RAZORPAY_KEY_SECRET;
            const generatedSignature = crypto_1.default
                .createHmac('sha256', secret)
                .update(razorpay_order_id + '|' + razorpay_payment_id)
                .digest('hex');
            if (generatedSignature !== razorpay_signature) {
                return res.status(400).json({ error: 'Invalid payment signature.' });
            }
            // Find the subscription plan from DB based on name and cycle
            const subscriptionPlan = await prisma_1.prisma.subscriptionPlan.findFirst({
                where: { name: { equals: plan, mode: 'insensitive' } }
            });
            const planId = subscriptionPlan?.id || 'default-plan-id';
            // For this implementation, we will update or create the OrganizationSubscription
            const orgSub = await prisma_1.prisma.organizationSubscription.upsert({
                where: { organizationId },
                update: {
                    status: 'ACTIVE',
                    billingCycle: billingCycle,
                    paymentProvider: 'RAZORPAY',
                    startDate: new Date(),
                    renewalDate: billingCycle === 'annual'
                        ? new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                        : new Date(new Date().setMonth(new Date().getMonth() + 1)),
                },
                create: {
                    organizationId,
                    planId: planId,
                    billingCycle: billingCycle,
                    status: 'ACTIVE',
                    paymentProvider: 'RAZORPAY',
                    startDate: new Date(),
                    renewalDate: billingCycle === 'annual'
                        ? new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                        : new Date(new Date().setMonth(new Date().getMonth() + 1)),
                }
            });
            res.json({ success: true, subscription: orgSub });
        }
        catch (error) {
            console.error('Error verifying Razorpay payment:', error);
            res.status(500).json({ error: 'Failed to verify payment.' });
        }
    }
    // --- End Razorpay Integration ---
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
