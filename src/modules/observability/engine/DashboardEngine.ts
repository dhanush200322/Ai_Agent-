import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { MetricsEngine } from './MetricsEngine';

@Injectable()
export class DashboardEngine {
  private readonly prisma = new PrismaClient();

  constructor(private readonly metrics: MetricsEngine) {}

  async getSystemDashboard() {
    return {
      status: 'OK',
      metrics: await this.metrics.getMetrics()
    };
  }

  async getOrganizationDashboard(organizationId: string) {
    const alerts = await this.prisma.alert.findMany({ where: { organizationId } });
    return {
      activeAlerts: alerts.filter(a => !a.resolved).length,
      totalAlerts: alerts.length,
    };
  }

  async getAIDashboard(organizationId: string) {
    const tokens = await this.prisma.tokenAnalytics.findMany({ where: { organizationId } });
    return {
      totalTokens: tokens.reduce((sum, t) => sum + t.totalTokens, 0),
    };
  }

  async getWorkflowDashboard(organizationId: string) {
    const workflows = await this.prisma.workflowHealth.findMany();
    return { workflows };
  }

  async getRuntimeDashboard(organizationId: string) {
    const agents = await this.prisma.agentHealth.findMany();
    return { agents };
  }

  async getBillingDashboard(organizationId: string) {
    const costs = await this.prisma.costAnalytics.findMany({ where: { organizationId } });
    return {
      totalCostUsd: costs.reduce((sum, c) => sum + c.costUsd, 0)
    };
  }

  async getQueueDashboard() {
    return await this.prisma.queueHealth.findMany();
  }

  async getSecurityDashboard(organizationId: string) {
    return await this.prisma.alert.findMany({ where: { organizationId, severity: 'CRITICAL' } });
  }

  async getDeveloperDashboard() {
    return await this.prisma.errorLog.findMany({ take: 50, orderBy: { createdAt: 'desc' } });
  }
}
