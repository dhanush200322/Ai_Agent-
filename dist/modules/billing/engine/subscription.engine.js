"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionEngine = void 0;
const prisma_1 = require("../../../shared/prisma");
class SubscriptionEngine {
    async subscribe(organizationId, planId) {
        const activeSub = await prisma_1.prisma.organizationSubscription.findUnique({
            where: { organizationId }
        });
        if (activeSub) {
            throw new Error('Organization already has a subscription.');
        }
        const sub = await prisma_1.prisma.organizationSubscription.create({
            data: {
                organizationId,
                planId,
                billingCycle: 'MONTHLY',
                status: 'TRIAL',
                renewalDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 day trial
            }
        });
        await prisma_1.prisma.billingEvent.create({
            data: {
                organizationId,
                eventType: 'SUBSCRIPTION_CREATED',
                payload: JSON.stringify({ subscriptionId: sub.id, status: 'TRIAL' })
            }
        });
        return sub;
    }
    async cancel(organizationId) {
        const sub = await prisma_1.prisma.organizationSubscription.update({
            where: { organizationId },
            data: {
                status: 'CANCELLED',
                cancelDate: new Date(),
                autoRenew: false
            }
        });
        await prisma_1.prisma.billingEvent.create({
            data: {
                organizationId,
                eventType: 'SUBSCRIPTION_CANCELLED',
                payload: JSON.stringify({ subscriptionId: sub.id })
            }
        });
        return sub;
    }
}
exports.SubscriptionEngine = SubscriptionEngine;
