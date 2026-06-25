"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalEngine = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class ApprovalEngine {
    async requestHumanApproval(executionId, nodeId) {
        const approval = await prisma.workflowApproval.create({
            data: {
                executionId,
                nodeId,
                status: 'PENDING'
            }
        });
        // Pause agent execution while waiting for human
        await prisma.agentExecution.update({
            where: { id: executionId },
            data: { status: 'PAUSED' }
        });
        return approval.id;
    }
    async getApprovalStatus(approvalId) {
        const approval = await prisma.workflowApproval.findUnique({ where: { id: approvalId } });
        if (!approval)
            throw new Error('Approval not found');
        return approval.status;
    }
}
exports.ApprovalEngine = ApprovalEngine;
