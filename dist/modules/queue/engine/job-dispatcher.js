"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobDispatcher = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class JobDispatcher {
    workers = new Map();
    registerWorkerClass(jobType, workerClass) {
        this.workers.set(jobType, workerClass);
    }
    // Common Middleware
    async dispatch(queueJob) {
        const payload = queueJob.payload;
        // 1. Validate Payload
        if (!payload.organizationId || !payload.id || !payload.traceId) {
            throw new Error(`Invalid Job Payload Contract for job ${queueJob.id}`);
        }
        // 2. Observability & DB Sync (Job Started)
        await prisma.jobQueue.update({
            where: { id: payload.id },
            data: { status: 'ACTIVE', startedAt: new Date(), attempts: queueJob.attemptsMade }
        });
        const execution = await prisma.jobExecution.create({
            data: {
                jobId: payload.id,
                organizationId: payload.organizationId,
                worker: process.pid.toString(),
                traceId: payload.traceId,
                retries: queueJob.attemptsMade - 1
            }
        });
        const startTime = Date.now();
        await queueJob.updateProgress(0);
        try {
            // 3. Load Organization Context (Placeholder for RBAC/Org Check)
            const org = await prisma.organization.findUnique({ where: { id: payload.organizationId } });
            if (!org)
                throw new Error("Organization not found");
            // 4. Route to specific worker
            // Assuming payload metadata contains the jobType if it's dynamic, or we route based on queue Name.
            // For simplicity, we assume we inject jobType into metadata:
            const jobType = payload.metadata?.jobType || 'UNKNOWN';
            const handler = this.workers.get(jobType);
            if (!handler) {
                throw new Error(`No worker registered for type ${jobType}`);
            }
            await handler(queueJob, { org });
            await queueJob.updateProgress(100);
            // 5. Success Sync
            await prisma.jobQueue.update({
                where: { id: payload.id },
                data: { status: 'COMPLETED', completedAt: new Date() }
            });
            await prisma.jobExecution.update({
                where: { id: execution.id },
                data: { finishedAt: new Date(), duration: Date.now() - startTime }
            });
        }
        catch (err) {
            // 6. Failure Sync
            await prisma.jobQueue.update({
                where: { id: payload.id },
                data: { status: 'FAILED', failedAt: new Date() }
            });
            await prisma.jobExecution.update({
                where: { id: execution.id },
                data: { finishedAt: new Date(), duration: Date.now() - startTime, logs: err.message }
            });
            throw err; // Re-throw for BullMQ to handle retry/DLQ
        }
    }
}
exports.JobDispatcher = JobDispatcher;
