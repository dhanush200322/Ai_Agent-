
import { QueueManager } from '../engine/queue-manager';
import { JobType } from '@prisma/client';
import { StandardQueueName } from '../types';
export class SchedulerService {
  constructor(private manager: QueueManager) {}
  async scheduleCron(_jobId: string, cron: string, payload: any) {
    await this.manager.enqueue({ queueName: StandardQueueName.SCHEDULER, type: JobType.WORKFLOW as any, payload, repeat: { pattern: cron } });
  }
  async cancelJob(_queueName: string, _jobId: string) {
    // Implementation
  }
}


