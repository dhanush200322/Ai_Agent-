import { QueueJob } from '../../queue/providers/queue-provider.interface';
import { RotationEngine } from '../engine/rotation.engine';

export class RotationWorker {
  private rotationEngine: RotationEngine;

  constructor() {
    this.rotationEngine = new RotationEngine();
  }

  async process(job: QueueJob): Promise<void> {
    const { secretId, strategy, metadata } = job.payload.payload;
    
    await job.log(`Starting rotation for secret ${secretId} via strategy ${strategy}`);
    await this.rotationEngine.executeRotation(secretId, strategy, metadata);
    await job.log(`Rotation completed for secret ${secretId}`);
  }
}
