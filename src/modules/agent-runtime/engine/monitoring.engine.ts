import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MonitoringEngine {
  public async logMetrics(organizationId: string, executionId: string, metrics: { latency: number, promptTokens: number, completionTokens: number, cost: number }): Promise<void> {
    await prisma.agentPerformanceMetrics.upsert({
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
    await prisma.systemMetric.createMany({
      data: [
        { organizationId, module: 'AGENT_RUNTIME', metricName: 'LATENCY', metricValue: metrics.latency },
        { organizationId, module: 'AGENT_RUNTIME', metricName: 'COST', metricValue: metrics.cost }
      ]
    });
  }

  public async logEvent(executionId: string, level: 'INFO' | 'WARN' | 'ERROR', message: string, metadata?: any): Promise<void> {
    await prisma.agentExecutionLog.create({
      data: {
        executionId,
        level,
        message,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });
  }
}
