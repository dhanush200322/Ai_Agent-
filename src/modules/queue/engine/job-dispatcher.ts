import { prisma } from '../../../shared/prisma';
import { QueueJob } from '../providers/queue-provider.interface';
import { PrismaClient } from '@prisma/client';
import { JobPayloadContract } from '../types';



export type WorkerFunction = (job: QueueJob, context: any) => Promise<void>;

export class JobDispatcher {
  private workers: Map<string, WorkerFunction> = new Map();

  registerWorkerClass(jobType: string, workerClass: WorkerFunction) {
    this.workers.set(jobType, workerClass);
  }

  // Common Middleware
  async dispatch(queueJob: QueueJob): Promise<void> {
    const payload = queueJob.payload as JobPayloadContract;
    
    // 1. Validate Payload
    if (!payload.organizationId || !payload.id || !payload.traceId) {
      throw new Error(`Invalid Job Payload Contract for job ${queueJob.id}`);
    }

    // 2. Observability & DB Sync (Job Started)
    await (prisma as any).jobQueue.update({
      where: { id: payload.id },
      data: { status: 'ACTIVE', startedAt: new Date(), attempts: queueJob.attemptsMade }
    });
    
    const execution = await (prisma as any).jobExecution.create({
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
      if (!org) throw new Error("Organization not found");

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
      await (prisma as any).jobQueue.update({
        where: { id: payload.id },
        data: { status: 'COMPLETED', completedAt: new Date() }
      });

      await (prisma as any).jobExecution.update({
        where: { id: execution.id },
        data: { finishedAt: new Date(), duration: Date.now() - startTime }
      });

    } catch (err: any) {
      // 6. Failure Sync
      await (prisma as any).jobQueue.update({
        where: { id: payload.id },
        data: { status: 'FAILED', failedAt: new Date() }
      });
      await (prisma as any).jobExecution.update({
        where: { id: execution.id },
        data: { finishedAt: new Date(), duration: Date.now() - startTime, logs: err.message }
      });
      throw err; // Re-throw for BullMQ to handle retry/DLQ
    }
  }
}

