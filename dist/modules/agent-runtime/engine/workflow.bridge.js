"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowBridge = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class WorkflowBridge {
    async triggerWorkflow(organizationId, workflowId, payload) {
        const execution = await prisma.workflowExecution.create({
            data: {
                organizationId,
                workflowId,
                workflowVersionId: 'default-version', // Mock for now, in prod resolve latest published version
                status: 'PENDING',
                state: JSON.stringify(payload)
            }
        });
        return execution.id;
    }
    async getWorkflowStatus(executionId) {
        const execution = await prisma.workflowExecution.findUnique({ where: { id: executionId } });
        return execution?.status || null;
    }
}
exports.WorkflowBridge = WorkflowBridge;
