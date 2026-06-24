import { PrismaClient } from '@prisma/client';
// MetricsService not used here directly

const prisma = new PrismaClient();

export class DashboardAggregator {
  /**
   * Generates a snapshot on demand by pulling raw metrics and aggregating them.
   */
  async generateSnapshot(organizationId: string | null): Promise<any> {
    // 1. Get raw metrics for the last hour
    const rawMetrics = await (prisma as any).systemMetric.findMany({
      where: {
        organizationId,
        timestamp: { gte: new Date(Date.now() - 60 * 60 * 1000) }
      }
    });

    const snapshot = {
      activeWorkflows: this.aggregate(rawMetrics, 'ActiveWorkflows'),
      activeAgents: this.aggregate(rawMetrics, 'ActiveAgents'),
      errorRate: this.aggregateAvg(rawMetrics, 'ErrorRate'),
      avgLatency: this.aggregateAvg(rawMetrics, 'WorkflowLatency')
    };

    return snapshot;
  }

  /**
   * Run via a cron background job to cache expensive dashboards
   */
  async cacheSnapshot(organizationId: string | null): Promise<void> {
    const snapshot = await this.generateSnapshot(organizationId);
    
    await (prisma as any).dashboardSnapshot.create({
      data: {
        organizationId,
        snapshot: JSON.stringify(snapshot)
      }
    });
  }

  private aggregate(metrics: any[], name: string): number {
    return metrics.filter(m => m.metricName === name).reduce((acc, curr) => acc + curr.metricValue, 0);
  }

  private aggregateAvg(metrics: any[], name: string): number {
    const filtered = metrics.filter(m => m.metricName === name);
    if (filtered.length === 0) return 0;
    return filtered.reduce((acc, curr) => acc + curr.metricValue, 0) / filtered.length;
  }
}
