import { NotificationProviderType } from '@prisma/client';

export class FailoverEngine {
  getFallbackProviderType(failedType: NotificationProviderType): NotificationProviderType | null {
    const chain: Record<NotificationProviderType, NotificationProviderType | null> = {
      SMTP: 'SENDGRID',
      SENDGRID: 'SES',
      SES: null,
      TWILIO: null,
      WHATSAPP: null,
      SLACK: null,
      DISCORD: null,
      WEBHOOK: null,
      FCM: null,
      INAPP: null
    };

    return chain[failedType] || null;
  }
}
