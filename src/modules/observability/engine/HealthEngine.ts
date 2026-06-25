import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LoggingEngine } from './LoggingEngine';

export enum HealthStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  DOWN = 'DOWN'
}

@Injectable()
export class HealthEngine {
  private readonly prisma = new PrismaClient();

  constructor(private readonly logger: LoggingEngine) {}

  async checkLiveness(): Promise<HealthStatus> {
    return HealthStatus.HEALTHY; 
  }

  async checkReadiness(): Promise<HealthStatus> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return HealthStatus.HEALTHY;
    } catch (e: any) {
      this.logger.error('Database readiness failed', e.stack, 'HealthEngine');
      return HealthStatus.DOWN;
    }
  }

  async checkStartup(): Promise<HealthStatus> {
    return HealthStatus.HEALTHY;
  }

  async checkDeepHealth(): Promise<Record<string, HealthStatus>> {
    const db = await this.checkReadiness();
    return {
      database: db,
      redis: HealthStatus.HEALTHY,
      queue: HealthStatus.HEALTHY
    };
  }

  async recordHealthCheck(component: string, type: string, status: HealthStatus, latency: number, message?: string) {
    await this.prisma.healthCheck.create({
      data: {
        component,
        type,
        status: status as any,
        latency,
        message
      }
    });
  }
}
