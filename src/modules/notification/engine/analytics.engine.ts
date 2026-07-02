import { prisma } from '../../../shared/prisma';
import { PrismaClient, NotificationChannel, NotificationProviderType, DeliveryStatus } from '@prisma/client';



export class AnalyticsEngine {
  async logEvent(params: {
    organizationId: string;
    notificationId?: string;
    channel: NotificationChannel;
    providerType: NotificationProviderType;
    status: DeliveryStatus;
    latency?: number;
    metadata?: Record<string, any>;
  }) {
    return await prisma.notificationAnalytics.create({
      data: {
        organizationId: params.organizationId,
        notificationId: params.notificationId,
        channel: params.channel,
        providerType: params.providerType,
        status: params.status,
        latency: params.latency,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });
  }

  async getMetrics(organizationId: string) {
    const total = await prisma.notificationAnalytics.count({
      where: { organizationId },
    });

    const statusCounts = await prisma.notificationAnalytics.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: true,
    });

    const channelCounts = await prisma.notificationAnalytics.groupBy({
      by: ['channel'],
      where: { organizationId },
      _count: true,
    });

    const avgLatency = await prisma.notificationAnalytics.aggregate({
      where: { organizationId },
      _avg: { latency: true },
    });

    return {
      total,
      statusCounts: statusCounts.reduce((acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
      }, {} as Record<string, number>),
      channelCounts: channelCounts.reduce((acc, curr) => {
        acc[curr.channel] = curr._count;
        return acc;
      }, {} as Record<string, number>),
      avgLatencyMs: avgLatency._avg.latency || 0,
    };
  }
}
