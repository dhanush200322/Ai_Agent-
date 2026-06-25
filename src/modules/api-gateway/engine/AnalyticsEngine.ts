import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AnalyticsEngine {
  private readonly logger = new Logger(AnalyticsEngine.name);
  private prisma = new PrismaClient();

  async recordApiUsage(apiKeyId: string, endpoint: string, method: string, statusCode: number, latencyMs: number) {
    this.logger.debug(`Recording API Usage for key ${apiKeyId}`);
    return this.prisma.apiUsage.create({
      data: { apiKeyId, endpoint, method, statusCode, latencyMs }
    });
  }

  async getAnalytics(apiKeyId: string) {
    return this.prisma.apiAnalytics.findMany({
      where: { apiKeyId }
    });
  }
}
