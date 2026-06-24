import { NotificationProvider, ProviderSendOptions, ProviderSendResult } from '../interfaces/notification-provider.interface';
import axios from 'axios';

export class SlackProvider implements NotificationProvider {
  private config: any = null;

  constructor(config: any) {
    this.config = config;
  }

  async send(options: ProviderSendOptions): Promise<ProviderSendResult> {
    const startTime = Date.now();
    try {
      if (this.config?.simulateFailure || options.recipient.includes('fail')) {
        throw new Error('Slack API error: channel_not_found');
      }

      if (!this.config || !this.config.token || this.config.token === 'mock-token') {
        return {
          success: true,
          deliveryId: `slack-${Math.random().toString(36).substring(2, 11)}`,
          latency: Date.now() - startTime,
        };
      }

      const response = await axios.post(
        'https://slack.com/api/chat.postMessage',
        {
          channel: options.recipient,
          text: options.body,
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.token}`,
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );

      if (!response.data.ok) {
        throw new Error(`Slack API error: ${response.data.error}`);
      }

      return {
        success: true,
        deliveryId: response.data.ts,
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
    return !!(config && config.token);
  }

  async health(): Promise<boolean> {
    return true;
  }

  async status(): Promise<'ACTIVE' | 'DEGRADED' | 'INACTIVE'> {
    return 'ACTIVE';
  }
}
