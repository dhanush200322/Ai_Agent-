import { PrismaClient } from '@prisma/client';

import { JobPayloadContract } from '../types';

const prisma = new PrismaClient();

export class DeadLetterService {
  async processFailedJob(_queueName: string, jobType: any, payload: any, reason: string, failedWorker: string, retryCount: number) {
    const jobPayload = payload as JobPayloadContract;
    
    // 1. Log to Dead Letter Queue in Postgres
    await (prisma as any).deadLetterJob.create({
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
    await (prisma as any).jobQueue.update({
      where: { id: jobPayload.id },
      data: { status: 'FAILED' }
    });

    // Note: The BullMQ Provider natively moves it to "failed" set. 
    // It's removed from there based on queue retention settings or custom cleanups.
  }
}


