"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingController = void 0;
const prisma_1 = require("../../../shared/prisma");
const subscription_engine_1 = require("../engine/subscription.engine");
const stripe_provider_1 = require("../providers/stripe.provider");
const queue_manager_1 = require("../../queue/engine/queue-manager");
const bullmq_provider_1 = require("../../queue/providers/bullmq.provider");
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
    async webhook(req, res) {
        const signature = req.headers['stripe-signature'];
        const rawBody = req.rawBody; // Assumes raw body parser is active for this route
        try {
            const event = this.stripeProvider.verifyWebhook(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_123');
            // 1. Store immutable webhook event
            const webhookEvent = await prisma_1.prisma.billingWebhookEvent.create({
                data: {
                    provider: 'STRIPE',
                    providerEventId: event.id,
                    eventType: event.type,
                    payload: JSON.stringify(event)
                }
            });
            // 2. Enqueue for asynchronous robust processing
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
