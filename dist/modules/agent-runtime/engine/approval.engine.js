"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalEngine = void 0;
const prisma_1 = require("../../../shared/prisma");
class ApprovalEngine {
    async requestHumanApproval(executionId, nodeId) {
        const approval = await prisma_1.prisma.workflowApproval.create({
            data: {
                executionId,
                nodeId,
                status: 'PENDING'
            }
        });
        // Pause agent execution while waiting for human
        await prisma_1.prisma.agentExecution.update({
            where: { id: executionId },
            data: { status: 'PAUSED' }
        });
        return approval.id;
    }
    async getApprovalStatus(approvalId) {
        const approval = await prisma_1.prisma.workflowApproval.findUnique({ where: { id: approvalId } });
        if (!approval)
            throw new Error('Approval not found');
        return approval.status;
    }
}
exports.ApprovalEngine = ApprovalEngine;
