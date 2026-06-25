"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowController = void 0;
const workflow_service_1 = require("../services/workflow.service");
const execution_service_1 = require("../services/execution.service");
const workflowService = new workflow_service_1.WorkflowService();
const executionService = new execution_service_1.ExecutionService();
class WorkflowController {
    static async createWorkflow(req, res) {
        try {
            const { organizationId, name, slug, description } = req.body;
            const wf = await workflowService.createWorkflow(organizationId, req.user.id, name, slug, description);
            res.json(wf);
        }
        catch (e) {
            res.status(400).json({ error: e.message });
        }
    }
    static async deployVersion(req, res) {
        try {
            const { workflowId } = req.params;
            const { nodes, connections, metadata } = req.body;
            const v = await workflowService.createVersion(workflowId, nodes, connections, metadata);
            const published = await workflowService.publishVersion(v.id);
            res.json(published);
        }
        catch (e) {
            res.status(400).json({ error: e.message });
        }
    }
    static async startExecution(req, res) {
        try {
            const { workflowId } = req.params;
            const { variables, agentId } = req.body;
            const ex = await executionService.startExecution(workflowId, variables, agentId);
            res.json(ex);
        }
        catch (e) {
            res.status(400).json({ error: e.message });
        }
    }
    static async approveExecution(req, res) {
        try {
            const { executionId, nodeId } = req.params;
            const approvalData = req.body;
            await executionService.resumeExecution(executionId, nodeId, approvalData);
            res.json({ success: true, message: 'Execution Resumed' });
        }
        catch (e) {
            res.status(400).json({ error: e.message });
        }
    }
}
exports.WorkflowController = WorkflowController;
