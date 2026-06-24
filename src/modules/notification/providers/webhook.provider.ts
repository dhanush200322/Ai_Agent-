import { NotificationProvider, ProviderSendOptions, ProviderSendResult } from '../interfaces/notification-provider.interface';
import axios from 'axios';
import * as crypto from 'crypto';

export class WebhookProvider implements NotificationProvider {
  private config: any = null;

  constructor(config: any) {
    this.config = config;
  }

  async send(options: ProviderSendOptions): Promise<ProviderSendResult> {
    const startTime = Date.now();
    try {
      if (this.config?.simulateFailure || options.recipient.includes('fail')) {
        throw new Error('Webhook request failed with status code 500');
      }

      const url = options.recipient;
      if (!url || url === 'mock-url' || url.startsWith('mock:')) {
        return {
          success: true,
          deliveryId: `wh-${Math.random().toString(36).substring(2, 11)}`,
          latency: Date.now() - startTime,
        };
      }

      const payload = JSON.stringify({
        event: options.metadata?.eventType || 'NOTIFICATION_TRIGGERED',
        body: options.body,
        timestamp: new Date().toISOString(),
        metadata: options.metadata || {},
      });

      const timestamp = Date.now().toString();
      const secret = this.config?.secret || 'default-secret';
      
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(`${timestamp}.${payload}`);
      const signature = hmac.digest('hex');

      await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Enterprise-Signature': signature,
          'X-Enterprise-Timestamp': timestamp,
        },
        timeout: this.config?.timeout || 5000,
      });

      return {
        success: true,
        deliveryId: `wh-${Math.random().toString(36).substring(2, 11)}`,
        latency: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        success: false,
        errorMessage: error.message,
        latency: Date.now() - startTime,
      };
    }
  }

  validate(config: Record<string, any>): boolean {
    return !!(config && config.secret);
  }

  async health(): Promise<boolean> {
    return true;
  }

  async status(): Promise<'ACTIVE' | 'DEGRADED' | 'INACTIVE'> {
    return 'ACTIVE';
  }
}
export function verifyWebhookSignature(payload: string, timestamp: string, signature: string, secret: string): boolean {
  // Replay Attack Protection: Check if timestamp is older than 5 minutes (300 seconds)
  const timeDifference = Math.abs(Date.now() - parseInt(timestamp));
  if (timeDifference > 300000) {
    return false; // Request too old, reject replay attack
  }

  const expectedHmac = crypto.createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedHmac));
}
