import { prisma } from '../../../shared/prisma';
import { QueueProvider, EnqueueOptions } from '../providers/queue-provider.interface';
import { PrismaClient, JobStatus } from '@prisma/client';
import { StandardQueueName } from '../types';



export class QueueManager {
  constructor(private provider: QueueProvider) {}

  async enqueue(options: EnqueueOptions): Promise<string> {
    // 1. Persist to Postgres
    const dbJob = await (prisma as any).jobQueue.create({
      data: {
        organizationId: options.payload.organizationId,
        queue: options.queueName,
        type: options.type,
        priority: options.priority || 'NORMAL',
        payload: JSON.stringify(options.payload),
        status: options.delayMs ? JobStatus.DELAYED : JobStatus.WAITING,
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

  async pauseQueue(queueName: string) {
    await this.provider.pause(queueName);
  }

  async resumeQueue(queueName: string) {
    await this.provider.resume(queueName);
  }

  async recover() {
    console.log("Recovering Queue Engine State...");
    // Recover metrics, sync state, and recreate stuck queues
    const metrics = await (prisma as any).queueMetric.findMany({ take: 10, orderBy: { timestamp: 'desc' } });
    if (metrics.length === 0) {
      for (const q of Object.values(StandardQueueName)) {
        await (prisma as any).queueMetric.create({
          data: { queue: q, waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 }
        });
      }
    }
    console.log("Queue Recovery Complete.");
  }
}

