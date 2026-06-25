import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LoggingEngine } from './LoggingEngine';
import { MetricsEngine } from './MetricsEngine';

@Injectable()
export class AlertEngine {
  private readonly prisma = new PrismaClient();

  constructor(
    private readonly logger: LoggingEngine,
    private readonly metrics: MetricsEngine,
  ) {}

  async evaluateThreshold(ruleId: string, metricValue: number) {
    const rule = await this.prisma.alertRule.findUnique({ where: { id: ruleId } });
    if (!rule || !rule.enabled) return;

    let isTriggered = false;
    switch (rule.condition) {
      case 'GREATER_THAN':
        isTriggered = metricValue > rule.threshold;
        break;
      case 'LESS_THAN':
        isTriggered = metricValue < rule.threshold;
        break;
      case 'ANOMALY':
        isTriggered = metricValue > rule.threshold * 3;
        break;
      case 'RATE_OF_CHANGE':
        isTriggered = metricValue > rule.threshold;
        break;
      case 'MISSING_HEARTBEAT':
        isTriggered = metricValue === 0;
        break;
    }

    if (isTriggered) {
      await this.triggerAlert(rule.id, rule.organizationId, rule.severity as any, `Threshold exceeded for ${rule.metricName}`);
    }
  }

  async triggerAlert(ruleId: string, organizationId: string | null, severity: string, message: string) {
    this.logger.warn(`Alert Triggered: ${message}`, 'AlertEngine');
    
    this.metrics.incrementCounter('alerts_triggered_total', { severity });

    const alert = await this.prisma.alert.create({
      data: {
        organizationId,
        ruleId,
        severity: severity as any,
        source: 'System',
        message,
        resolved: false
      }
    });

    await this.prisma.alertHistory.create({
      data: {
        alertId: alert.id,
        organizationId,
        action: 'CREATED',
        details: JSON.stringify({ message, severity })
      }
    });
  }
}
