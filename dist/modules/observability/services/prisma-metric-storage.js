"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaMetricStorage = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class PrismaMetricStorage {
    async recordMetric(organizationId, module, metricName, value, tags) {
        await prisma.systemMetric.create({
            data: {
                organizationId,
                module,
                metricName,
                metricValue: value,
                tags: tags ? JSON.stringify(tags) : null
            }
        });
    }
    async getMetrics(module, metricName, startTime, endTime) {
        return prisma.systemMetric.findMany({
            where: {
                module,
                metricName,
                timestamp: { gte: startTime, lte: endTime }
            },
            orderBy: { timestamp: 'asc' }
        });
    }
    async purgeOldMetrics(retentionDays) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - retentionDays);
        const result = await prisma.systemMetric.deleteMany({
            where: { timestamp: { lt: cutoff } }
        });
        return result.count;
    }
}
exports.PrismaMetricStorage = PrismaMetricStorage;
