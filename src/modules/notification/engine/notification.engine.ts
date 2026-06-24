import { PrismaClient, NotificationChannel, NotificationPriority, NotificationStatus } from '@prisma/client';
import { DeliveryEngine } from './delivery.engine';
import { BullMQProvider } from '../../queue/providers/bullmq.provider';

const prisma = new PrismaClient();

export interface TriggerNotificationParams {
  organizationId: string;
  userId?: string;
  recipient: string;
  channel: NotificationChannel;
  priority?: NotificationPriority;
  subject?: string;
  body: string;
  variables?: Record<string, any>;
  templateId?: string;
  scheduledAt?: Date;
}

export class NotificationEngine {
  private deliveryEngine = new DeliveryEngine();
  private queueProvider: BullMQProvider | null = null;

  constructor() {
    try {
      this.queueProvider = new BullMQProvider();
    } catch {
      this.queueProvider = null;
    }
  }

  async trigger(params: TriggerNotificationParams): Promise<any> {
    const priority = params.priority || 'NORMAL';

    const notification = await prisma.notification.create({
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
      await prisma.notificationSchedule.create({
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
          priority: priority as any,
          payload: {
            id: Math.random().toString(),
            organizationId: params.organizationId,
            correlationId: notification.id,
            traceId: notification.id,
            priority: priority as any,
            retries: 0,
            payload: { notificationId: notification.id },
            metadata: { jobType: 'NOTIFICATION' },
            createdAt: new Date(),
          },
        });
        return notification;
      } catch (err) {
        console.warn('BullMQ enqueue failed, processing synchronously:', err);
      }
    }

    await this.deliveryEngine.deliver(notification.id);
    return await prisma.notification.findUnique({ where: { id: notification.id } });
  }
}
