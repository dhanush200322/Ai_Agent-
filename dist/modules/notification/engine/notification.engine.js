"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationEngine = void 0;
const prisma_1 = require("../../../shared/prisma");
const delivery_engine_1 = require("./delivery.engine");
const bullmq_provider_1 = require("../../queue/providers/bullmq.provider");
class NotificationEngine {
    deliveryEngine = new delivery_engine_1.DeliveryEngine();
    queueProvider = null;
    constructor() {
        try {
            this.queueProvider = new bullmq_provider_1.BullMQProvider();
        }
        catch {
            this.queueProvider = null;
        }
    }
    async trigger(params) {
        const priority = params.priority || 'NORMAL';
        const notification = await prisma_1.prisma.notification.create({
            data: {
                organizationId: params.organizationId,
                userId: params.userId || null,
                recipient: params.recipient,
                channel: params.channel,
                priority,
                status: params.scheduledAt ? 'PENDING' : 'QUEUED',
                subject: params.subject || null,
                body: params.body,
                variables: params.variables ? JSON.stringify(params.variables) : null,
                templateId: params.templateId || null,
                scheduledAt: params.scheduledAt || null,
            },
        });
        if (params.scheduledAt && params.scheduledAt.getTime() > Date.now()) {
            await prisma_1.prisma.notificationSchedule.create({
                data: {
                    notificationId: notification.id,
                    runAt: params.scheduledAt,
                    isActive: true,
                },
            });
            return notification;
        }
        if (this.queueProvider) {
            try {
                await this.queueProvider.enqueue({
                    queueName: 'notification',
                    type: 'NOTIFICATION',
                    priority: priority,
                    payload: {
                        id: Math.random().toString(),
                        organizationId: params.organizationId,
                        correlationId: notification.id,
                        traceId: notification.id,
                        priority: priority,
                        retries: 0,
                        payload: { notificationId: notification.id },
                        metadata: { jobType: 'NOTIFICATION' },
                        createdAt: new Date(),
                    },
                });
                return notification;
            }
            catch (err) {
                console.warn('BullMQ enqueue failed, processing synchronously:', err);
            }
        }
        await this.deliveryEngine.deliver(notification.id);
        return await prisma_1.prisma.notification.findUnique({ where: { id: notification.id } });
    }
}
exports.NotificationEngine = NotificationEngine;
