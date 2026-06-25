"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowWorker = void 0;
const execution_service_1 = require("../services/execution.service");
const executionService = new execution_service_1.ExecutionService();
const WorkflowWorker = async (job, _context) => {
    await job.updateProgress(10);
    await job.log(`Starting background workflow execution for job ${job.id}`);
    const { workflowId, variables, agentId } = job.payload.payload;
    if (!workflowId) {
        throw new Error('Missing workflowId in worker payload');
    }
    await executionService.startExecution(workflowId, variables || {}, agentId);
    await job.updateProgress(100);
    await job.log('Workflow execution completed in background');
};
exports.WorkflowWorker = WorkflowWorker;
