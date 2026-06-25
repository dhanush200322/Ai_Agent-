"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerWorker = void 0;
const runtime_engine_1 = require("../engine/runtime.engine");
const monitoring_engine_1 = require("../engine/monitoring.engine");
const runtimeEngine = new runtime_engine_1.RuntimeEngine();
const monitoringEngine = new monitoring_engine_1.MonitoringEngine();
class SchedulerWorker {
    async processJob(job) {
        const { executionId, agentId, goal, organizationId } = job.data;
        try {
            if (executionId) {
                // Delayed execution continuation
                await runtimeEngine.resume(executionId);
                await monitoringEngine.logEvent(executionId, 'INFO', 'Resumed scheduled execution');
                return { action: 'RESUMED', executionId };
            }
            else if (agentId && goal) {
                // New scheduled execution
                const result = await runtimeEngine.spawn({ organizationId, agentId, goal });
                return { action: 'SPAWNED', executionId: result.executionId };
            }
        }
        catch (error) {
            throw error;
        }
    }
}
exports.SchedulerWorker = SchedulerWorker;
