"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeadLetterService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class DeadLetterService {
    async processFailedJob(_queueName, jobType, payload, reason, failedWorker, retryCount) {
        const jobPayload = payload;
        // 1. Log to Dead Letter Queue in Postgres
        await prisma.deadLetterJob.create({
            data: {
                organizationId: jobPayload.organizationId,
                queue: _queueName,
                type: jobType,
                payload: JSON.stringify(jobPayload),
                reason,
                failedWorker,
                retryCount
            }
        });
        // 2. Mark Original JobQueue as Permanently FAILED
        await prisma.jobQueue.update({
            where: { id: jobPayload.id },
            data: { status: 'FAILED' }
        });
        // Note: The BullMQ Provider natively moves it to "failed" set. 
        // It's removed from there based on queue retention settings or custom cleanups.
    }
}
exports.DeadLetterService = DeadLetterService;
