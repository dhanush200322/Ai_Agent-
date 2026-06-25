"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecoveryEngine = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class RecoveryEngine {
    async createCheckpoint(executionId, state) {
        const checkpoint = await prisma.agentCheckpoint.create({
            data: {
                executionId,
                state: JSON.stringify(state)
            }
        });
        return checkpoint.id;
    }
    async restoreFromLatestCheckpoint(executionId) {
        const checkpoint = await prisma.agentCheckpoint.findFirst({
            where: { executionId },
            orderBy: { createdAt: 'desc' }
        });
        if (!checkpoint)
            return null;
        // Reset status to RUNNING
        await prisma.agentExecution.update({
            where: { id: executionId },
            data: { status: 'RUNNING' }
        });
        return JSON.parse(checkpoint.state);
    }
    async recoverCrashedExecutions() {
        // Find RUNNING executions where the heartbeat of the agent is OFFLINE
        // For a real production system, this would be more robust
        const crashedExecutions = await prisma.agentExecution.findMany({
            where: {
                status: 'RUNNING',
                agent: {
                    heartbeat: {
                        status: 'OFFLINE'
                    }
                }
            }
        });
        for (const exec of crashedExecutions) {
            await prisma.agentExecution.update({
                where: { id: exec.id },
                data: { status: 'PAUSED', error: 'Recovered from crash' }
            });
        }
    }
}
exports.RecoveryEngine = RecoveryEngine;
