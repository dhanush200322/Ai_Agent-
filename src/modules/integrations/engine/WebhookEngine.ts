import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class WebhookEngine {
  private readonly logger = new Logger(WebhookEngine.name);

  constructor(private readonly prisma: PrismaClient) {}

  async initialize() {
    this.logger.log('Initializing WebhookEngine...');
  }

  async verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  }

  async processInboundWebhook(provider: string, headers: any, body: any) {
    this.logger.log(`Processing inbound webhook for ${provider}`);
    // Extract timestamp, signature
    // Replay protection: check timestamp is within 5 minutes
    // Validate signature
    
    // Store as ExternalEvent for processing
    return { status: 'RECEIVED' };
  }

  async dispatchOutboundWebhook(subscriptionId: string, eventName: string, payload: any) {
    this.logger.log(`Dispatching outbound webhook to ${subscriptionId}`);
    // Queue to BullMQ with retries and DLQ
  }

  async healthCheck() {
    return { status: 'HEALTHY' };
  }
}
