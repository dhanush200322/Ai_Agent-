import { prisma } from '../../../shared/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class WebhookEngine {
  private readonly logger = new Logger(WebhookEngine.name);
  private readonly prisma = prisma;

  async dispatchWebhook(applicationId: string, event: string, payload: any) {
    this.logger.debug(`Dispatching webhook for app ${applicationId}, event ${event}`);
    const webhooks = await this.prisma.apiWebhook.findMany({
      where: { applicationId, status: 'ACTIVE' }
    });

    for (const webhook of webhooks) {
      if (webhook.events.includes('*') || webhook.events.includes(event)) {
        await this.sendPayload(webhook, event, payload);
      }
    }
  }

  private async sendPayload(webhook: any, event: string, payload: any) {
    const signature = crypto.createHmac('sha256', webhook.secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    try {
      const response = await axios.post(webhook.url, payload, {
        headers: {
          'x-webhook-signature': signature,
          'x-webhook-event': event,
          'x-webhook-timestamp': Date.now().toString()
        }
      });
      await this.prisma.apiWebhookDelivery.create({
        data: {
          webhookId: webhook.id,
          eventId: event,
          payload,
          statusCode: response.status,
          status: 'SUCCESS'
        }
      });
    } catch (error: any) {
      this.logger.error(`Webhook delivery failed for ${webhook.id}`, error);
      await this.prisma.apiWebhookDelivery.create({
        data: {
          webhookId: webhook.id,
          eventId: event,
          payload,
          statusCode: error.response?.status || 500,
          status: 'FAILED',
          error: error.message
        }
      });
      // Further DLQ/Retry logic goes here (managed by worker)
    }
  }
}
