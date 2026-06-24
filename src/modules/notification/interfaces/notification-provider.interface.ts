import { NotificationPriority } from '@prisma/client';

export interface ProviderSendOptions {
  recipient: string;
  subject?: string;
  body: string;
  attachments?: Array<{
    fileName: string;
    filePath: string;
    mimeType: string;
  }>;
  metadata?: Record<string, any>;
}

export interface ProviderSendResult {
  success: boolean;
  deliveryId?: string;
  errorMessage?: string;
  latency?: number;
}

export interface NotificationProvider {
  send(options: ProviderSendOptions): Promise<ProviderSendResult>;
  validate(config: Record<string, any>): boolean;
  health(): Promise<boolean>;
  status(): Promise<'ACTIVE' | 'DEGRADED' | 'INACTIVE'>;
}
