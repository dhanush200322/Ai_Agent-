"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsEngine = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AnalyticsEngine {
    async logEvent(params) {
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
    async getMetrics(organizationId) {
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
            }, {}),
            channelCounts: channelCounts.reduce((acc, curr) => {
                acc[curr.channel] = curr._count;
                return acc;
            }, {}),
            avgLatencyMs: avgLatency._avg.latency || 0,
        };
    }
}
exports.AnalyticsEngine = AnalyticsEngine;
