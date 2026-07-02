"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeEngine = void 0;
const prisma_1 = require("../../../shared/prisma");
class RuntimeEngine {
    async spawn(input) {
        const execution = await prisma_1.prisma.agentExecution.create({
            data: {
                organizationId: input.organizationId,
                agentId: input.agentId,
                sessionId: input.sessionId,
                goal: input.goal,
                status: 'PENDING'
            }
        });
        if (input.variables) {
            for (const [key, value] of Object.entries(input.variables)) {
                await prisma_1.prisma.agentContext.upsert({
                    where: { agentId_key: { agentId: input.agentId, key } },
                    update: { value: JSON.stringify(value) },
                    create: { agentId: input.agentId, key, value: JSON.stringify(value) }
                });
            }
        }
        return {
            executionId: execution.id,
            status: execution.status
        };
    }
    async pause(executionId) {
        await prisma_1.prisma.agentExecution.update({
            where: { id: executionId },
            data: { status: 'PAUSED' }
        });
    }
    async resume(executionId) {
        await prisma_1.prisma.agentExecution.update({
            where: { id: executionId },
            data: { status: 'RUNNING' }
        });
    }
    async cancel(executionId) {
        await prisma_1.prisma.agentExecution.update({
            where: { id: executionId },
            data: { status: 'CANCELED', finishedAt: new Date() }
        });
    }
    async terminate(executionId, error) {
        await prisma_1.prisma.agentExecution.update({
            where: { id: executionId },
            data: { status: 'FAILED', error, finishedAt: new Date() }
        });
    }
}
exports.RuntimeEngine = RuntimeEngine;
