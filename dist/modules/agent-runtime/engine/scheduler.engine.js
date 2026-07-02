"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerEngine = void 0;
const prisma_1 = require("../../../shared/prisma");
const client_1 = require("@prisma/client");
class SchedulerEngine {
    async scheduleExecution(organizationId, executionId, delayMs) {
        await prisma_1.prisma.scheduledJob.create({
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
        await prisma_1.prisma.scheduledJob.create({
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
