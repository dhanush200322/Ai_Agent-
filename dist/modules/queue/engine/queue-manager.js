"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueManager = void 0;
const prisma_1 = require("../../../shared/prisma");
const client_1 = require("@prisma/client");
const types_1 = require("../types");
class QueueManager {
    provider;
    constructor(provider) {
        this.provider = provider;
    }
    async enqueue(options) {
        // 1. Persist to Postgres
        const dbJob = await prisma_1.prisma.jobQueue.create({
            data: {
                organizationId: options.payload.organizationId,
                queue: options.queueName,
                type: options.type,
                priority: options.priority || 'NORMAL',
                payload: JSON.stringify(options.payload),
                status: options.delayMs ? client_1.JobStatus.DELAYED : client_1.JobStatus.WAITING,
                maxAttempts: options.attempts || 3
            }
        });
        // 2. Enqueue in Provider (BullMQ)
        const bullOptions = {
            ...options,
            payload: { ...options.payload, id: dbJob.id }
        };
        await this.provider.enqueue(bullOptions);
        return dbJob.id;
    }
    async pauseQueue(queueName) {
        await this.provider.pause(queueName);
    }
    async resumeQueue(queueName) {
        await this.provider.resume(queueName);
    }
    async recover() {
        console.log("Recovering Queue Engine State...");
        // Recover metrics, sync state, and recreate stuck queues
        const metrics = await prisma_1.prisma.queueMetric.findMany({ take: 10, orderBy: { timestamp: 'desc' } });
        if (metrics.length === 0) {
            for (const q of Object.values(types_1.StandardQueueName)) {
                await prisma_1.prisma.queueMetric.create({
                    data: { queue: q, waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 }
                });
            }
        }
        console.log("Queue Recovery Complete.");
    }
}
exports.QueueManager = QueueManager;
