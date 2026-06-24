import { PrismaClient } from '@prisma/client';
import { QueueJob } from '../../queue/providers/queue-provider.interface';

const prisma = new PrismaClient();

export class DeadLetterWorker {
  async process(job: QueueJob): Promise<void> {
    const notificationId = job.payload?.payload?.notificationId;
    if (!notificationId) return;

    await prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'FAILED', errorMessage: `Failed permanently in queue: ${(job.payload as any)?.reason || 'Unknown error'}` },
    });
  }
}
