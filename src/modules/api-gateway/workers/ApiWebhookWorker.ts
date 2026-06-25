import { Injectable, Logger } from '@nestjs/common';
import { WebhookEngine } from '../engine/WebhookEngine';

@Injectable()
export class ApiWebhookWorker {
  private readonly logger = new Logger(ApiWebhookWorker.name);

  constructor(private readonly webhookEngine: WebhookEngine) {}

  async processWebhookQueue(job: any) {
    this.logger.debug(`Processing webhook queue for job ${job.id}`);
    await this.webhookEngine.dispatchWebhook(job.data.applicationId, job.data.event, job.data.payload);
    return { success: true };
  }
}
