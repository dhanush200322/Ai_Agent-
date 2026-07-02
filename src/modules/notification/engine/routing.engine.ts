import { prisma } from '../../../shared/prisma';
import { PrismaClient, NotificationChannel, NotificationProviderType } from '@prisma/client';



export class RoutingEngine {
  async getProvidersForChannel(organizationId: string, channel: NotificationChannel): Promise<any[]> {
    let providers = await prisma.notificationProvider.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      orderBy: {
        priority: 'asc',
      },
    });

    if (providers.length === 0) {
      providers = await prisma.notificationProvider.findMany({
        where: {
          organizationId: null,
          isActive: true,
        },
        orderBy: {
          priority: 'asc',
        },
      });
    }

    const channelProviderMap: Record<NotificationChannel, NotificationProviderType[]> = {
      EMAIL: ['SMTP', 'SENDGRID', 'SES'],
      SMS: ['TWILIO'],
      WHATSAPP: ['WHATSAPP'],
      PUSH: ['FCM'],
      SLACK: ['SLACK'],
      MS_TEAMS: ['SLACK'],
      DISCORD: ['DISCORD'],
      WEBHOOK: ['WEBHOOK'],
      IN_APP: ['INAPP']
    };

    const allowedTypes = channelProviderMap[channel] || [];
    return providers.filter(p => allowedTypes.includes(p.type));
  }
}
