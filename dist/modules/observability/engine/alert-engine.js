"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertEngine = void 0;
const client_1 = require("@prisma/client");
const notification_dispatcher_1 = require("./notification-dispatcher");
const prisma = new client_1.PrismaClient();
class AlertEngine {
    dispatcher;
    constructor(dispatcher) {
        this.dispatcher = dispatcher || new notification_dispatcher_1.DefaultNotificationDispatcher();
    }
    /**
     * Evaluates incoming metrics against configured rules.
     */
    async evaluateMetric(metricName, value, organizationId = null) {
        const rules = await prisma.alertRule.findMany({
            where: { metricName, enabled: true, organizationId }
        });
        for (const rule of rules) {
            let triggered = false;
            if (rule.condition === 'GREATER_THAN' && value > rule.threshold)
                triggered = true;
            if (rule.condition === 'LESS_THAN' && value < rule.threshold)
                triggered = true;
            if (rule.condition === 'EQUALS' && value === rule.threshold)
                triggered = true;
            if (triggered) {
                await this.triggerAlert(rule, value);
            }
        }
    }
    async triggerAlert(rule, actualValue) {
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
exports.AlertEngine = AlertEngine;
