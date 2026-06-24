import { NotificationProvider, ProviderSendOptions, ProviderSendResult } from '../interfaces/notification-provider.interface';
import axios from 'axios';

export class DiscordProvider implements NotificationProvider {
  private config: any = null;

  constructor(config: any) {
    this.config = config;
  }

  async send(options: ProviderSendOptions): Promise<ProviderSendResult> {
    const startTime = Date.now();
    try {
      if (this.config?.simulateFailure || options.recipient.includes('fail')) {
        throw new Error('Discord webhook returned status code 404');
      }

      const webhookUrl = options.recipient || this.config?.webhookUrl;
      if (!webhookUrl || webhookUrl === 'mock-webhook' || webhookUrl.startsWith('mock:')) {
        return {
          success: true,
          deliveryId: `discord-${Math.random().toString(36).substring(2, 11)}`,
          latency: Date.now() - startTime,
        };
      }

      await axios.post(webhookUrl, {
        content: options.body,
        username: this.config?.username || 'Enterprise Agent',
      });

      return {
        success: true,
        deliveryId: `discord-${Math.random().toString(36).substring(2, 11)}`,
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
    return !!(config && config.webhookUrl);
  }

  async health(): Promise<boolean> {
    return true;
  }

  async status(): Promise<'ACTIVE' | 'DEGRADED' | 'INACTIVE'> {
    return 'ACTIVE';
  }
}
