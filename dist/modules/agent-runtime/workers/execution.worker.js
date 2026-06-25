"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionWorker = void 0;
const execution_engine_1 = require("../engine/execution.engine");
const runtime_engine_1 = require("../engine/runtime.engine");
const monitoring_engine_1 = require("../engine/monitoring.engine");
const executionEngine = new execution_engine_1.ExecutionEngine();
const runtimeEngine = new runtime_engine_1.RuntimeEngine();
const monitoringEngine = new monitoring_engine_1.MonitoringEngine();
class ExecutionWorker {
    async processJob(job) {
        const { executionId, stepId, action, organizationId } = job.data;
        try {
            const result = await executionEngine.executeStep(executionId, stepId, action);
            await monitoringEngine.logEvent(executionId, 'INFO', `Step ${stepId} executed`, { action, result });
            return result;
        }
        catch (error) {
            await monitoringEngine.logEvent(executionId, 'ERROR', `Step ${stepId} failed`, { action, error: error.message });
            // Depending on retry logic, might trigger RetryWorker
            throw error;
        }
    }
}
exports.ExecutionWorker = ExecutionWorker;
