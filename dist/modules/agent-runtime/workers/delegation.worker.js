"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelegationWorker = void 0;
const coordination_engine_1 = require("../engine/coordination.engine");
const monitoring_engine_1 = require("../engine/monitoring.engine");
const coordinationEngine = new coordination_engine_1.CoordinationEngine();
const monitoringEngine = new monitoring_engine_1.MonitoringEngine();
class DelegationWorker {
    async processJob(job) {
        const { sourceAgentId, targetAgentId, taskDefinition, executionId } = job.data;
        try {
            const delegationId = await coordinationEngine.delegateTask(sourceAgentId, targetAgentId, taskDefinition);
            await monitoringEngine.logEvent(executionId, 'INFO', `Delegated task to agent ${targetAgentId}`, { delegationId });
            return delegationId;
        }
        catch (error) {
            await monitoringEngine.logEvent(executionId, 'ERROR', `Delegation failed to agent ${targetAgentId}`, { error: error.message });
            throw error;
        }
    }
}
exports.DelegationWorker = DelegationWorker;
