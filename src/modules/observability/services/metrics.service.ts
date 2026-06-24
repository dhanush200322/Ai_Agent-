import { MetricStorageInterface } from './metric-storage.interface';
import { PrismaMetricStorage } from './prisma-metric-storage';

export class MetricsService {
  private storage: MetricStorageInterface;

  constructor(storage?: MetricStorageInterface) {
    this.storage = storage || new PrismaMetricStorage();
  }

  /**
   * Records a metric. Designed to be non-blocking.
   */
  record(module: string, metricName: string, value: number, tags?: Record<string, string>, organizationId: string | null = null): void {
    // Fire and forget so we don't block main application threads
    this.storage.recordMetric(organizationId, module, metricName, value, tags).catch(err => {
      console.error(`[MetricsService] Failed to record metric ${metricName}:`, err);
    });
  }

  async query(module: string, metricName: string, hours: number = 1): Promise<any[]> {
    const end = new Date();
    const start = new Date(end.getTime() - (hours * 60 * 60 * 1000));
    return this.storage.getMetrics(module, metricName, start, end);
  }

  async cleanup(retentionDays: number = 7): Promise<number> {
    return this.storage.purgeOldMetrics(retentionDays);
  }
}
