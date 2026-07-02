"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeteringEngine = void 0;
const prisma_1 = require("../../../shared/prisma");
class MeteringEngine {
    async recordUsageEvent(organizationId, type, quantity, metadata) {
        await prisma_1.prisma.usageEvent.create({
            data: {
                organizationId,
                type,
                quantity: BigInt(quantity),
                metadata: metadata ? JSON.stringify(metadata) : null,
            }
        });
    }
    async aggregateHourlyUsage(organizationId, type) {
        // This is called by a CRON job.
        // Finds all un-aggregated UsageEvents for the hour and creates a UsageSummary.
        const now = new Date();
        const startOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
        const endOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 59, 59, 999);
        const result = await prisma_1.prisma.usageEvent.aggregate({
            where: {
                organizationId,
                type,
                timestamp: { gte: startOfHour, lte: endOfHour }
            },
            _sum: { quantity: true }
        });
        const total = result._sum.quantity || BigInt(0);
        if (total > BigInt(0)) {
            await prisma_1.prisma.usageSummary.upsert({
                where: {
                    organizationId_type_period_startDate: {
                        organizationId,
                        type,
                        period: 'HOURLY',
                        startDate: startOfHour
                    }
                },
                create: {
                    organizationId,
                    type,
                    period: 'HOURLY',
                    startDate: startOfHour,
                    endDate: endOfHour,
                    totalQuantity: total
                },
                update: {
                    totalQuantity: { increment: total }
                }
            });
        }
    }
}
exports.MeteringEngine = MeteringEngine;
