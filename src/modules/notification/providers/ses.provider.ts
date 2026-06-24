import { NotificationProvider, ProviderSendOptions, ProviderSendResult } from '../interfaces/notification-provider.interface';

export class SESProvider implements NotificationProvider {
  private config: any = null;

  constructor(config: any) {
    this.config = config;
  }

  async send(options: ProviderSendOptions): Promise<ProviderSendResult> {
    const startTime = Date.now();
    try {
      if (this.config?.simulateFailure || options.recipient.includes('fail')) {
        throw new Error('SES service unavailable or sandbox restriction');
      }
      return {
        success: true,
        deliveryId: `ses-${Math.random().toString(36).substring(2, 11)}`,
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
    return !!(config && config.region && config.accessKeyId);
  }

  async health(): Promise<boolean> {
    return true;
  }

  async status(): Promise<'ACTIVE' | 'DEGRADED' | 'INACTIVE'> {
    return 'ACTIVE';
  }
}
