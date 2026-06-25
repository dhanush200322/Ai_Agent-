"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowWorker = void 0;
const WorkflowWorker = async (_job, _context) => {
    await _job.updateProgress(50);
    await _job.log('Workflow running');
    await _job.updateProgress(100);
};
exports.WorkflowWorker = WorkflowWorker;
