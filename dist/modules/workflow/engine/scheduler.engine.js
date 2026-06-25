"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerEngine = void 0;
const prisma_1 = require("../prisma");
const queue_manager_1 = require("../../queue/engine/queue-manager");
const bullmq_provider_1 = require("../../queue/providers/bullmq.provider");
const queueProvider = new bullmq_provider_1.BullMQProvider();
const queueManager = new queue_manager_1.QueueManager(queueProvider);
class SchedulerEngine {
    /**
     * Registers a workflow cron schedule.
     */
    async registerSchedule(workflowId, cron, timezone = 'UTC') {
        const workflow = await prisma_1.prisma.workflow.findUnique({
            where: { id: workflowId }
        });
        if (!workflow)
            throw new Error('Workflow not found');
        // 1. Save schedule to Database
        const schedule = await prisma_1.prisma.workflowSchedule.create({
            data: {
                workflowId,
                cron,
                timezone,
                enabled: true
            }
        });
        // 2. Register Repeatable Job in BullMQ
        await queueProvider.enqueue({
            queueName: 'scheduler',
            type: 'WORKFLOW',
            payload: {
                id: schedule.id,
                organizationId: workflow.organizationId,
                correlationId: workflowId,
                traceId: workflowId,
                priority: 'NORMAL',
                retries: 0,
                payload: {
                    workflowId,
                    scheduleId: schedule.id,
                    timezone
                },
                metadata: {},
                createdAt: new Date()
            },
            repeat: {
                pattern: cron
            }
        });
        return schedule;
    }
    /**
     * Disables a schedule and removes it from queue repeat jobs.
     */
    async disableSchedule(scheduleId) {
        await prisma_1.prisma.workflowSchedule.update({
            where: { id: scheduleId },
            data: { enabled: false }
        });
        // Clean repeatable job
        await queueProvider.removeJob('scheduler', scheduleId);
    }
    /**
     * Triggers a delayed workflow execution.
     */
    async scheduleDelayedExecution(workflowId, delayMs, variables = {}) {
        const workflow = await prisma_1.prisma.workflow.findUnique({
            where: { id: workflowId }
        });
        if (!workflow)
            throw new Error('Workflow not found');
        // Enqueue a delayed execution job
        const jobId = await queueManager.enqueue({
            queueName: 'workflow',
            type: 'WORKFLOW',
            delayMs,
            payload: {
                id: Math.random().toString(),
                organizationId: workflow.organizationId,
                correlationId: workflowId,
                traceId: workflowId,
                priority: 'NORMAL',
                retries: 0,
                payload: {
                    workflowId,
                    variables
                },
                metadata: {},
                createdAt: new Date()
            }
        });
        return jobId;
    }
}
exports.SchedulerEngine = SchedulerEngine;
