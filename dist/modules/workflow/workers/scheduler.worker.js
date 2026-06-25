"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerWorker = void 0;
const execution_service_1 = require("../services/execution.service");
const executionService = new execution_service_1.ExecutionService();
const SchedulerWorker = async (job, _context) => {
    const { workflowId } = job.payload.payload;
    if (!workflowId) {
        throw new Error('Missing workflowId in schedule trigger payload');
    }
    await job.log(`Scheduler triggered execution for workflow: ${workflowId}`);
    await executionService.startExecution(workflowId, { triggerType: 'SCHEDULER' });
    await job.updateProgress(100);
};
exports.SchedulerWorker = SchedulerWorker;
