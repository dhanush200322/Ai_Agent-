"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalNode = void 0;
const prisma_1 = require("../prisma");
class ApprovalNode {
    type = 'approval';
    async execute(node, context) {
        await prisma_1.prisma.workflowApproval.create({
            data: {
                executionId: context.execution.id,
                nodeId: node.id,
                status: 'PENDING'
            }
        });
        return {
            status: 'PAUSED',
            output: { message: 'Waiting for human approval' }
        };
    }
    async resume(node, context, approvalData) {
        const approvalRecord = await prisma_1.prisma.workflowApproval.findFirst({
            where: { executionId: context.execution.id, nodeId: node.id },
            orderBy: { requestedAt: 'desc' }
        });
        if (!approvalRecord) {
            return { status: 'FAILED', error: 'Approval record not found' };
        }
        if (approvalData?.approved === true) {
            await prisma_1.prisma.workflowApproval.update({
                where: { id: approvalRecord.id },
                data: { status: 'APPROVED', approvedAt: new Date() }
            });
            return { status: 'COMPLETED', output: { approved: true, notes: approvalData.notes } };
        }
        else {
            await prisma_1.prisma.workflowApproval.update({
                where: { id: approvalRecord.id },
                data: { status: 'REJECTED', approvedAt: new Date() }
            });
            return { status: 'FAILED', error: 'Workflow rejected by human' };
        }
    }
    validate(_node) {
        return null;
    }
}
exports.ApprovalNode = ApprovalNode;
