"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const prisma_metric_storage_1 = require("./prisma-metric-storage");
class MetricsService {
    storage;
    constructor(storage) {
        this.storage = storage || new prisma_metric_storage_1.PrismaMetricStorage();
    }
    /**
     * Records a metric. Designed to be non-blocking.
     */
    record(module, metricName, value, tags, organizationId = null) {
        // Fire and forget so we don't block main application threads
        this.storage.recordMetric(organizationId, module, metricName, value, tags).catch(err => {
            console.error(`[MetricsService] Failed to record metric ${metricName}:`, err);
        });
    }
    async query(module, metricName, hours = 1) {
        const end = new Date();
        const start = new Date(end.getTime() - (hours * 60 * 60 * 1000));
        return this.storage.getMetrics(module, metricName, start, end);
    }
    async cleanup(retentionDays = 7) {
        return this.storage.purgeOldMetrics(retentionDays);
    }
}
exports.MetricsService = MetricsService;
