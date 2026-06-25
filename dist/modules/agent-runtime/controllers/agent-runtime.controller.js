"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRuntimeController = void 0;
const agent_runtime_service_1 = require("../services/agent-runtime.service");
class AgentRuntimeController {
    service = new agent_runtime_service_1.AgentRuntimeService();
    startExecution = async (req, res) => {
        try {
            const { organizationId, agentId } = req.params;
            const { goal, sessionId, variables } = req.body;
            const result = await this.service.startExecution(organizationId, agentId, goal, sessionId, variables);
            res.status(201).json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    pauseExecution = async (req, res) => {
        try {
            const { executionId } = req.params;
            const result = await this.service.pauseExecution(executionId);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    resumeExecution = async (req, res) => {
        try {
            const { executionId } = req.params;
            const result = await this.service.resumeExecution(executionId);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    cancelExecution = async (req, res) => {
        try {
            const { executionId } = req.params;
            const result = await this.service.cancelExecution(executionId);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    getAgentMetadata = async (req, res) => {
        try {
            const { organizationId, agentId } = req.params;
            const metadata = await this.service.getAgentMetadata(organizationId, agentId);
            if (!metadata) {
                res.status(404).json({ error: 'Agent not found' });
                return;
            }
            res.status(200).json(metadata);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
}
exports.AgentRuntimeController = AgentRuntimeController;
