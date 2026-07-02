import { prisma } from '../../../shared/prisma';
import { PrismaClient } from '@prisma/client';
import { DeliveryEngine } from '../engine/delivery.engine';


const deliveryEngine = new DeliveryEngine();

export class NotificationCleanupWorker {
  async process(): Promise<void> {
    const now = new Date();
    const schedules = await prisma.notificationSchedule.findMany({
      where: {
        isActive: true,
        runAt: { lte: now },
      },
      include: { notification: true },
    });

    for (const schedule of schedules) {
      try {
        await deliveryEngine.deliver(schedule.notificationId);

        await prisma.notificationSchedule.update({
          where: { id: schedule.id },
          data: {
            isActive: false,
            lastRunAt: now,
          },
        });
      } catch (err) {
        console.error(`Scheduled notification delivery failed for schedule ID ${schedule.id}:`, err);
      }
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await prisma.notification.deleteMany({
      where: {
        createdAt: { lte: thirtyDaysAgo },
        status: { in: ['SENT', 'CANCELLED', 'FAILED'] }
      }
    });
  }
}
