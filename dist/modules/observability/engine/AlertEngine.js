"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertEngine = void 0;
const prisma_1 = require("../../../shared/prisma");
const common_1 = require("@nestjs/common");
const LoggingEngine_1 = require("./LoggingEngine");
const MetricsEngine_1 = require("./MetricsEngine");
let AlertEngine = class AlertEngine {
    logger;
    metrics;
    prisma = prisma_1.prisma;
    constructor(logger, metrics) {
        this.logger = logger;
        this.metrics = metrics;
    }
    async evaluateThreshold(ruleId, metricValue) {
        const rule = await this.prisma.alertRule.findUnique({ where: { id: ruleId } });
        if (!rule || !rule.enabled)
            return;
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
            await this.triggerAlert(rule.id, rule.organizationId, rule.severity, `Threshold exceeded for ${rule.metricName}`);
        }
    }
    async triggerAlert(ruleId, organizationId, severity, message) {
        this.logger.warn(`Alert Triggered: ${message}`, 'AlertEngine');
        this.metrics.incrementCounter('alerts_triggered_total', { severity });
        const alert = await this.prisma.alert.create({
            data: {
                organizationId,
                ruleId,
                severity: severity,
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
};
exports.AlertEngine = AlertEngine;
exports.AlertEngine = AlertEngine = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [LoggingEngine_1.LoggingEngine,
        MetricsEngine_1.MetricsEngine])
], AlertEngine);
