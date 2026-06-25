"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryWorker = void 0;
const execution_service_1 = require("../services/execution.service");
const executionService = new execution_service_1.ExecutionService();
const RetryWorker = async (job, _context) => {
    const { executionId, nodeId, approvalData } = job.payload.payload;
    if (!executionId || !nodeId) {
        throw new Error('Missing executionId or nodeId in retry payload');
    }
    await job.log(`Retrying execution ${executionId} starting at node ${nodeId}`);
    await executionService.resumeExecution(executionId, nodeId, approvalData || {});
    await job.updateProgress(100);
};
exports.RetryWorker = RetryWorker;
