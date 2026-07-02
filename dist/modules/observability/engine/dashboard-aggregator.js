"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardAggregator = void 0;
const prisma_1 = require("../../../shared/prisma");
// MetricsService not used here directly
class DashboardAggregator {
    /**
     * Generates a snapshot on demand by pulling raw metrics and aggregating them.
     */
    async generateSnapshot(organizationId) {
        // 1. Get raw metrics for the last hour
        const rawMetrics = await prisma_1.prisma.systemMetric.findMany({
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
    async cacheSnapshot(organizationId) {
        const snapshot = await this.generateSnapshot(organizationId);
        await prisma_1.prisma.dashboardSnapshot.create({
            data: {
                organizationId,
                snapshot: JSON.stringify(snapshot)
            }
        });
    }
    aggregate(metrics, name) {
        return metrics.filter(m => m.metricName === name).reduce((acc, curr) => acc + curr.metricValue, 0);
    }
    aggregateAvg(metrics, name) {
        const filtered = metrics.filter(m => m.metricName === name);
        if (filtered.length === 0)
            return 0;
        return filtered.reduce((acc, curr) => acc + curr.metricValue, 0) / filtered.length;
    }
}
exports.DashboardAggregator = DashboardAggregator;
