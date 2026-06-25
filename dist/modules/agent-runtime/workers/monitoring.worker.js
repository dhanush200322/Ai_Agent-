"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringWorker = void 0;
const monitoring_engine_1 = require("../engine/monitoring.engine");
const monitoringEngine = new monitoring_engine_1.MonitoringEngine();
class MonitoringWorker {
    async processJob(job) {
        const { executionId, level, message, metadata, organizationId, metrics } = job.data;
        try {
            if (metrics) {
                await monitoringEngine.logMetrics(organizationId, executionId, metrics);
            }
            if (message) {
                await monitoringEngine.logEvent(executionId, level || 'INFO', message, metadata);
            }
            return { success: true };
        }
        catch (error) {
            throw error;
        }
    }
}
exports.MonitoringWorker = MonitoringWorker;
