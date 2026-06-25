"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateManager = void 0;
// @ts-nocheck
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class StateManager {
    async saveState(context) {
        const stateStr = JSON.stringify(context.variables.getScope());
        await prisma.workflowExecution.update({
            where: { id: context.execution.id },
            data: { state: stateStr }
        });
    }
    async loadState(executionId) {
        const ex = await prisma.workflowExecution.findUnique({ where: { id: executionId } });
        if (!ex || !ex.state)
            return null;
        return JSON.parse(ex.state);
    }
    async logNodeStart(executionId, nodeId, nodeType, input) {
        return prisma.workflowExecutionLog.create({
            data: {
                executionId,
                nodeId,
                nodeType,
                status: 'RUNNING',
                input: JSON.stringify(input)
            }
        });
    }
    async logNodeFinish(logId, status, output, error) {
        return prisma.workflowExecutionLog.update({
            where: { id: logId },
            data: {
                status,
                output: output ? JSON.stringify(output) : null,
                error: error || null,
                finishedAt: new Date()
            }
        });
    }
    async setExecutionStatus(executionId, status) {
        await prisma.workflowExecution.update({
            where: { id: executionId },
            data: {
                status,
                ...(status === 'COMPLETED' || status === 'FAILED' ? { finishedAt: new Date() } : {})
            }
        });
    }
}
exports.StateManager = StateManager;
