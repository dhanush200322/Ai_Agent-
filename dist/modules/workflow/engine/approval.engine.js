"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalEngine = void 0;
const prisma_1 = require("../prisma");
const notification_engine_1 = require("../../notification/engine/notification.engine");
const notificationEngine = new notification_engine_1.NotificationEngine();
class ApprovalEngine {
    /**
     * Creates an approval request and triggers notification alert.
     */
    async createApprovalRequest(executionId, nodeId, organizationId) {
        const approval = await prisma_1.prisma.workflowApproval.create({
            data: {
                executionId,
                nodeId,
                status: 'PENDING'
            }
        });
        // Notify organization owners/admins about the approval required
        try {
            await notificationEngine.trigger({
                organizationId,
                recipient: 'admin@test.com', // fallback/placeholder, in production map to role users
                channel: 'EMAIL',
                subject: 'Workflow Approval Required',
                body: `Workflow execution ${executionId} reached a step that requires human approval. Node: ${nodeId}.`
            });
        }
        catch (e) {
            console.warn('[ApprovalEngine] Failed to trigger notification:', e);
        }
        return approval;
    }
    /**
     * Automatically expires pending approvals that have timed out.
     */
    async checkApprovalTimeouts() {
        const timeoutDuration = 1000 * 60 * 60 * 24; // 24 hours threshold
        const thresholdDate = new Date(Date.now() - timeoutDuration);
        const pendingApprovals = await prisma_1.prisma.workflowApproval.findMany({
            where: {
                status: 'PENDING',
                requestedAt: { lt: thresholdDate }
            }
        });
        for (const app of pendingApprovals) {
            await prisma_1.prisma.workflowApproval.update({
                where: { id: app.id },
                data: { status: 'EXPIRED' }
            });
            // In production we would resume the workflow execution with status 'FAILED' or timeout
        }
        return pendingApprovals.length;
    }
}
exports.ApprovalEngine = ApprovalEngine;
