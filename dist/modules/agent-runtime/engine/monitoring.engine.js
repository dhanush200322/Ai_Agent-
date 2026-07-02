"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringEngine = void 0;
const prisma_1 = require("../../../shared/prisma");
class MonitoringEngine {
    async logMetrics(organizationId, executionId, metrics) {
        await prisma_1.prisma.agentPerformanceMetrics.upsert({
            where: { executionId },
            update: {
                totalLatency: { increment: metrics.latency },
                promptTokens: { increment: metrics.promptTokens },
                completionTokens: { increment: metrics.completionTokens },
                totalCost: { increment: metrics.cost }
            },
            create: {
                executionId,
                totalLatency: metrics.latency,
                promptTokens: metrics.promptTokens,
                completionTokens: metrics.completionTokens,
                totalCost: metrics.cost
            }
        });
        // Also push to generic SystemMetrics for Phase 6.10 observability
        await prisma_1.prisma.systemMetric.createMany({
            data: [
                { organizationId, module: 'AGENT_RUNTIME', metricName: 'LATENCY', metricValue: metrics.latency },
                { organizationId, module: 'AGENT_RUNTIME', metricName: 'COST', metricValue: metrics.cost }
            ]
        });
    }
    async logEvent(executionId, level, message, metadata) {
        await prisma_1.prisma.agentExecutionLog.create({
            data: {
                executionId,
                level,
                message,
                metadata: metadata ? JSON.stringify(metadata) : null
            }
        });
    }
}
exports.MonitoringEngine = MonitoringEngine;
