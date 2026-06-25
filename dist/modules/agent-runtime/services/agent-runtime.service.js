"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRuntimeService = void 0;
const runtime_engine_1 = require("../engine/runtime.engine");
const registry_engine_1 = require("../engine/registry.engine");
class AgentRuntimeService {
    runtimeEngine = new runtime_engine_1.RuntimeEngine();
    registryEngine = new registry_engine_1.RegistryEngine();
    async startExecution(organizationId, agentId, goal, sessionId, variables) {
        const input = { organizationId, agentId, sessionId, goal, variables };
        return await this.runtimeEngine.spawn(input);
    }
    async pauseExecution(executionId) {
        await this.runtimeEngine.pause(executionId);
        return { success: true, status: 'PAUSED' };
    }
    async resumeExecution(executionId) {
        await this.runtimeEngine.resume(executionId);
        return { success: true, status: 'RUNNING' };
    }
    async cancelExecution(executionId) {
        await this.runtimeEngine.cancel(executionId);
        return { success: true, status: 'CANCELED' };
    }
    async getAgentMetadata(organizationId, agentId) {
        return await this.registryEngine.getAgentMetadata(organizationId, agentId);
    }
}
exports.AgentRuntimeService = AgentRuntimeService;
