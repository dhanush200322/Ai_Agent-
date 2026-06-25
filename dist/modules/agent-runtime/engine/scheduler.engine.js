"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerEngine = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class SchedulerEngine {
    async scheduleExecution(organizationId, executionId, delayMs) {
        await prisma.scheduledJob.create({
            data: {
                organizationId,
                queue: 'agent-runtime',
                type: client_1.JobType.AGENT_RUNTIME,
                payload: JSON.stringify({ executionId }),
                intervalMs: delayMs,
                oneTime: true,
                nextRunAt: new Date(Date.now() + delayMs)
            }
        });
    }
    async scheduleCron(organizationId, agentId, cronExpression, goal) {
        await prisma.scheduledJob.create({
            data: {
                organizationId,
                queue: 'agent-runtime',
                type: client_1.JobType.AGENT_RUNTIME,
                payload: JSON.stringify({ agentId, goal }),
                cronExpression,
                oneTime: false,
                nextRunAt: new Date() // Ideally calculate next tick based on cron
            }
        });
    }
}
exports.SchedulerEngine = SchedulerEngine;
