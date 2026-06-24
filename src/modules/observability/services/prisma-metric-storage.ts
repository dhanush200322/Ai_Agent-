import { PrismaClient } from '@prisma/client';
import { MetricStorageInterface } from './metric-storage.interface';

const prisma = new PrismaClient();

export class PrismaMetricStorage implements MetricStorageInterface {
  async recordMetric(organizationId: string | null, module: string, metricName: string, value: number, tags?: Record<string, string>): Promise<void> {
    await prisma.systemMetric.create({
      data: {
        organizationId,
        module,
        metricName,
        metricValue: value,
        tags: tags ? JSON.stringify(tags) : null
      }
    });
  }

  async getMetrics(module: string, metricName: string, startTime: Date, endTime: Date): Promise<any[]> {
    return prisma.systemMetric.findMany({
      where: {
        module,
        metricName,
        timestamp: { gte: startTime, lte: endTime }
      },
      orderBy: { timestamp: 'asc' }
    });
  }

  async purgeOldMetrics(retentionDays: number): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);
    const result = await prisma.systemMetric.deleteMany({
      where: { timestamp: { lt: cutoff } }
    });
    return result.count;
  }
}
