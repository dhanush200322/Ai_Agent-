import { NotificationProvider, ProviderSendOptions, ProviderSendResult } from '../interfaces/notification-provider.interface';
import * as nodemailer from 'nodemailer';

export class SMTPProvider implements NotificationProvider {
  private transporter: nodemailer.Transporter | null = null;
  private config: any = null;

  constructor(config: any) {
    this.config = config;
    if (config && config.host && config.host !== 'mock-host') {
      this.transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.pass,
        },
      });
    }
  }

  async send(options: ProviderSendOptions): Promise<ProviderSendResult> {
    const startTime = Date.now();
    try {
      if (!this.transporter || this.config.host === 'mock-host') {
        // Check for simulated failure to test retry/failover logic
        if (this.config.simulateFailure || options.recipient.includes('fail')) {
          throw new Error('SMTP connection timed out');
        }
        return {
          success: true,
          deliveryId: `smtp-${Math.random().toString(36).substring(2, 11)}`,
          latency: Date.now() - startTime,
        };
      }
      
      const mailOptions: any = {
        from: this.config.from || 'noreply@enterprise.com',
        to: options.recipient,
        subject: options.subject || 'No Subject',
        html: options.body,
      };

      if (options.attachments && options.attachments.length > 0) {
        mailOptions.attachments = options.attachments.map(att => ({
          filename: att.fileName,
          path: att.filePath,
        }));
      }

      const info = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        deliveryId: info.messageId,
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
    return !!(config && config.host && config.port);
  }

  async health(): Promise<boolean> {
    if (!this.transporter || this.config.host === 'mock-host') return true;
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }

  async status(): Promise<'ACTIVE' | 'DEGRADED' | 'INACTIVE'> {
    const isHealthy = await this.health();
    return isHealthy ? 'ACTIVE' : 'DEGRADED';
  }
}
