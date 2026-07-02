import { prisma } from '../../../shared/prisma';
import { PrismaClient } from '@prisma/client';
import { NotificationDispatcher, DefaultNotificationDispatcher } from './notification-dispatcher';



export class AlertEngine {
  private dispatcher: NotificationDispatcher;

  constructor(dispatcher?: NotificationDispatcher) {
    this.dispatcher = dispatcher || new DefaultNotificationDispatcher();
  }

  /**
   * Evaluates incoming metrics against configured rules.
   */
  async evaluateMetric(metricName: string, value: number, organizationId: string | null = null) {
    const rules = await prisma.alertRule.findMany({
      where: { metricName, enabled: true, organizationId }
    });

    for (const rule of rules) {
      let triggered = false;
      if (rule.condition === 'GREATER_THAN' && value > rule.threshold) triggered = true;
      if (rule.condition === 'LESS_THAN' && value < rule.threshold) triggered = true;
      if (rule.condition === 'EQUALS' && value === rule.threshold) triggered = true;

      if (triggered) {
        await this.triggerAlert(rule, value);
      }
    }
  }

  private async triggerAlert(rule: any, actualValue: number) {
    // 1. Deduplication: Check if there's an unresolved alert for this rule already
    const existing = await prisma.alert.findFirst({
      where: { ruleId: rule.id, resolved: false }
    });

    if (existing) {
      // Alert already exists and is unacknowledged. Don't spam.
      return;
    }

    const message = `Rule [${rule.name}] triggered. Value ${actualValue} evaluated against ${rule.condition} ${rule.threshold}`;

    await prisma.alert.create({
      data: {
        organizationId: rule.organizationId,
        ruleId: rule.id,
        severity: rule.severity,
        source: 'Metric Evaluation Engine',
        message
      }
    });

    if (rule.notification) {
      await this.dispatcher.dispatch(rule.notification, `Alert: ${rule.name}`, message, rule.severity);
    }
  }
}
