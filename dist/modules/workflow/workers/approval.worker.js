"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalWorker = void 0;
const approval_engine_1 = require("../engine/approval.engine");
const approvalEngine = new approval_engine_1.ApprovalEngine();
const ApprovalWorker = async (job, _context) => {
    await job.log('Checking for expired workflow approvals...');
    const expiredCount = await approvalEngine.checkApprovalTimeouts();
    await job.log(`Marked ${expiredCount} approvals as expired.`);
    await job.updateProgress(100);
};
exports.ApprovalWorker = ApprovalWorker;
