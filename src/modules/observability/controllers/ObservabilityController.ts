import { prisma } from '../../../shared/prisma';
import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { HealthEngine } from '../engine/HealthEngine';
import { MetricsEngine } from '../engine/MetricsEngine';
import { DashboardEngine } from '../engine/DashboardEngine';
import { ProfilingEngine } from '../engine/ProfilingEngine';
import { AlertEngine } from '../engine/AlertEngine';
import { PrismaClient } from '@prisma/client';

@Controller('api/v1/observability')
export class ObservabilityController {
  private readonly prisma = prisma;

  constructor(
    private readonly healthEngine: HealthEngine,
    private readonly metricsEngine: MetricsEngine,
    private readonly dashboardEngine: DashboardEngine,
    private readonly profilingEngine: ProfilingEngine,
    private readonly alertEngine: AlertEngine,
  ) {}

  @Get('health')
  async getHealth() {
    return await this.healthEngine.checkDeepHealth();
  }

  @Get('metrics')
  async getMetrics() {
    return await this.metricsEngine.getMetrics();
  }

  @Get('traces')
  async getTraces() {
    return { status: 'Exported via OTLP' };
  }

  @Get('logs')
  async getLogs(@Query('organizationId') orgId?: string) {
    if (orgId) {
      return await this.prisma.errorLog.findMany({ where: { organizationId: orgId }, take: 100, orderBy: { createdAt: 'desc' } });
    }
    return await this.prisma.errorLog.findMany({ take: 100, orderBy: { createdAt: 'desc' } });
  }

  @Get('errors')
  async getErrors() {
    return await this.prisma.exceptionEvent.findMany({ take: 100, orderBy: { createdAt: 'desc' } });
  }

  @Get('alerts')
  async getAlerts(@Query('organizationId') orgId?: string) {
    const where = orgId ? { organizationId: orgId } : {};
    return await this.prisma.alert.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  @Get('dashboard')
  async getDashboard(@Query('type') type: string, @Query('organizationId') orgId?: string) {
    switch(type) {
      case 'SYSTEM': return await this.dashboardEngine.getSystemDashboard();
      case 'ORGANIZATION': return await this.dashboardEngine.getOrganizationDashboard(orgId || '');
      case 'AI': return await this.dashboardEngine.getAIDashboard(orgId || '');
      case 'WORKFLOW': return await this.dashboardEngine.getWorkflowDashboard(orgId || '');
      case 'RUNTIME': return await this.dashboardEngine.getRuntimeDashboard(orgId || '');
      case 'BILLING': return await this.dashboardEngine.getBillingDashboard(orgId || '');
      case 'QUEUE': return await this.dashboardEngine.getQueueDashboard();
      case 'SECURITY': return await this.dashboardEngine.getSecurityDashboard(orgId || '');
      case 'DEVELOPER': return await this.dashboardEngine.getDeveloperDashboard();
      default: return await this.dashboardEngine.getSystemDashboard();
    }
  }

  @Get('analytics')
  async getAnalytics(@Query('organizationId') orgId?: string) {
    if (orgId) {
      return await this.prisma.usageAnalytics.findMany({ where: { organizationId: orgId }, take: 100, orderBy: { timestamp: 'desc' } });
    }
    return await this.prisma.usageAnalytics.findMany({ take: 100, orderBy: { timestamp: 'desc' } });
  }

  @Get('profiling')
  async getProfiling() {
    return await this.prisma.performanceProfile.findMany({ take: 50, orderBy: { createdAt: 'desc' } });
  }

  @Post('alerts')
  async createAlertRule(@Body() body: any) {
    return await this.prisma.alertRule.create({ data: body });
  }

  @Put('alerts/:id')
  async updateAlertRule(@Param('id') id: string, @Body() body: any) {
    return await this.prisma.alertRule.update({ where: { id }, data: body });
  }

  @Delete('alerts/:id')
  async deleteAlertRule(@Param('id') id: string) {
    return await this.prisma.alertRule.delete({ where: { id } });
  }
}
