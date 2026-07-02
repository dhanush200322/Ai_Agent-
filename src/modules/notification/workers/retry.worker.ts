import { prisma } from '../../../shared/prisma';
import { PrismaClient } from '@prisma/client';
import { DeliveryEngine } from '../engine/delivery.engine';
import { RetryEngine } from '../engine/retry.engine';
import { QueueJob } from '../../queue/providers/queue-provider.interface';


const deliveryEngine = new DeliveryEngine();
const retryEngine = new RetryEngine();

export class RetryWorker {
  async process(job: QueueJob): Promise<void> {
    const notificationId = job.payload?.payload?.notificationId;
    if (!notificationId) return;

    const notif = await prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notif) return;

    if (notif.retryCount >= notif.maxRetries) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { status: 'FAILED', errorMessage: 'Max retries exceeded' },
      });
      return;
    }

    const delay = retryEngine.calculateBackoff(notif.retryCount);
    await new Promise(resolve => setTimeout(resolve, Math.min(delay, 50)));

    await deliveryEngine.deliver(notificationId);
  }
}
