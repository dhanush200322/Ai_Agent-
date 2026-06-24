import { QueueJob } from '../../queue/providers/queue-provider.interface';
import { MeteringEngine } from '../engine/metering.engine';
import { QuotaEngine } from '../engine/quota.engine';

export class UsageCollectorWorker {
  private meteringEngine: MeteringEngine;
  private quotaEngine: QuotaEngine;

  constructor() {
    this.meteringEngine = new MeteringEngine();
    this.quotaEngine = new QuotaEngine();
  }

  async process(job: QueueJob): Promise<void> {
    const { organizationId, type, quantity, metadata } = job.payload.payload;
    
    // 1. Persist immutable UsageEvent for billing aggregation
    await this.meteringEngine.recordUsageEvent(organizationId, type, quantity, metadata);

    // 2. Increment fast Redis Quota Engine counter
    await this.quotaEngine.recordUsage(organizationId, type, quantity);
  }
}
