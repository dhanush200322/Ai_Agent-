"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryWorker = void 0;
const execution_engine_1 = require("../engine/execution.engine");
const monitoring_engine_1 = require("../engine/monitoring.engine");
const executionEngine = new execution_engine_1.ExecutionEngine();
const monitoringEngine = new monitoring_engine_1.MonitoringEngine();
class RetryWorker {
    async processJob(job) {
        const { executionId, stepId, action, maxRetries } = job.data;
        try {
            await monitoringEngine.logEvent(executionId, 'INFO', `Retrying step ${stepId}`);
            const result = await executionEngine.executeWithRetry(executionId, action, maxRetries);
            return result;
        }
        catch (error) {
            await monitoringEngine.logEvent(executionId, 'ERROR', `Retry exhausted for step ${stepId}`, { error: error.message });
            throw error;
        }
    }
}
exports.RetryWorker = RetryWorker;
