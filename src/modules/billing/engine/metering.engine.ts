import { prisma } from '../../../shared/prisma';
import { PrismaClient } from '@prisma/client';



export class MeteringEngine {
  
  async recordUsageEvent(organizationId: string, type: string, quantity: number, metadata?: any): Promise<void> {
    await prisma.usageEvent.create({
      data: {
        organizationId,
        type,
        quantity: BigInt(quantity),
        metadata: metadata ? JSON.stringify(metadata) : null,
      }
    });
  }

  async aggregateHourlyUsage(organizationId: string, type: string): Promise<void> {
    // This is called by a CRON job.
    // Finds all un-aggregated UsageEvents for the hour and creates a UsageSummary.
    const now = new Date();
    const startOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
    const endOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 59, 59, 999);

    const result = await prisma.usageEvent.aggregate({
      where: {
        organizationId,
        type,
        timestamp: { gte: startOfHour, lte: endOfHour }
      },
      _sum: { quantity: true }
    });

    const total = result._sum.quantity || BigInt(0);

    if (total > BigInt(0)) {
      await prisma.usageSummary.upsert({
        where: {
          organizationId_type_period_startDate: {
            organizationId,
            type,
            period: 'HOURLY',
            startDate: startOfHour
          }
        },
        create: {
          organizationId,
          type,
          period: 'HOURLY',
          startDate: startOfHour,
          endDate: endOfHour,
          totalQuantity: total
        },
        update: {
          totalQuantity: { increment: total }
        }
      });
    }
  }
}
