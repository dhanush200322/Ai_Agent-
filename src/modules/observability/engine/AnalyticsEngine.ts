import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AnalyticsEngine {
  private readonly prisma = new PrismaClient();

  async recordTokenUsage(organizationId: string, model: string, promptTokens: number, completionTokens: number) {
    await this.prisma.tokenAnalytics.create({
      data: {
        organizationId,
        model,
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens
      }
    });
  }

  async recordCost(organizationId: string, service: string, costUsd: number) {
    await this.prisma.costAnalytics.create({
      data: {
        organizationId,
        service,
        costUsd
      }
    });
  }

  async recordUsage(organizationId: string, metricName: string, value: number) {
    await this.prisma.usageAnalytics.create({
      data: {
        organizationId,
        metricName,
        value
      }
    });
  }
}
