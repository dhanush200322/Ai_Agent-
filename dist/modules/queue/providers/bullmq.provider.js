"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BullMQProvider = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../../../config/redis");
class BullMQProvider {
    connection;
    queues = new Map();
    workers = new Map();
    queueEvents = new Map();
    constructor() {
        this.connection = redis_1.RedisConnectionManager.getClient();
    }
    getQueue(queueName) {
        if (!this.queues.has(queueName)) {
            const queue = new bullmq_1.Queue(queueName, { connection: this.connection });
            this.queues.set(queueName, queue);
            const events = new bullmq_1.QueueEvents(queueName, { connection: this.connection });
            this.queueEvents.set(queueName, events);
        }
        return this.queues.get(queueName);
    }
    async enqueue(options) {
        const queue = this.getQueue(options.queueName);
        // Map JobPriority enum to BullMQ priority (lower number = higher priority)
        // CRITICAL=1, HIGH=2, NORMAL=3, LOW=4
        let bullPriority = 3;
        if (options.priority === 'CRITICAL')
            bullPriority = 1;
        if (options.priority === 'HIGH')
            bullPriority = 2;
        if (options.priority === 'LOW')
            bullPriority = 4;
        const job = await queue.add(options.type, options.payload, {
            delay: options.delayMs,
            priority: bullPriority,
            attempts: options.attempts || 3,
            backoff: options.backoff ? {
                type: options.backoff.type.toLowerCase(),
                delay: options.backoff.delay
            } : undefined,
            repeat: options.repeat,
            jobId: options.payload.id // enforce our correlation ID
        });
        return job.id;
    }
    async pause(queueName) {
        const queue = this.getQueue(queueName);
        await queue.pause();
    }
    async resume(queueName) {
        const queue = this.getQueue(queueName);
        await queue.resume();
    }
    async drain(queueName) {
        const queue = this.getQueue(queueName);
        await queue.drain();
    }
    async clean(queueName, grace, status) {
        const queue = this.getQueue(queueName);
        await queue.clean(grace, 1000, status);
    }
    async removeJob(queueName, jobId) {
        const queue = this.getQueue(queueName);
        const job = await queue.getJob(jobId);
        if (job)
            await job.remove();
    }
    async getMetrics(queueName) {
        const queue = this.getQueue(queueName);
        const counts = await queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed');
        return counts;
    }
    registerWorker(queueName, concurrency, processor) {
        const worker = new bullmq_1.Worker(queueName, async (job) => {
            const queueJob = {
                id: job.id,
                name: job.name,
                payload: job.data,
                attemptsMade: job.attemptsMade,
                updateProgress: async (progress) => { await job.updateProgress(progress); },
                log: async (message) => { await job.log(message); }
            };
            await processor(queueJob);
        }, {
            connection: redis_1.RedisConnectionManager.getConnectionOptions(),
            concurrency
        });
        this.workers.set(`${queueName}-${Date.now()}`, worker);
    }
    async disconnect() {
        for (const worker of this.workers.values()) {
            await worker.close();
        }
        for (const events of this.queueEvents.values()) {
            await events.close();
        }
        for (const queue of this.queues.values()) {
            await queue.close();
        }
        this.connection.disconnect();
    }
}
exports.BullMQProvider = BullMQProvider;
