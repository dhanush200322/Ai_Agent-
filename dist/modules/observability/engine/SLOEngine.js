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
exports.SLOEngine = void 0;
const common_1 = require("@nestjs/common");
const MetricsEngine_1 = require("./MetricsEngine");
let SLOEngine = class SLOEngine {
    metrics;
    constructor(metrics) {
        this.metrics = metrics;
    }
    recordRequest(service, success, latencyMs) {
        this.metrics.incrementCounter('slo_requests_total', { service });
        if (success) {
            this.metrics.incrementCounter('slo_requests_success', { service });
        }
        else {
            this.metrics.incrementCounter('slo_requests_error', { service });
            this.metrics.incrementCounter('slo_error_budget_burn', { service }, 1);
        }
        this.metrics.observeHistogram('slo_request_latency', { service }, latencyMs);
    }
    recordUptime(service, isUp) {
        this.metrics.setGauge('slo_uptime_status', { service }, isUp ? 1 : 0);
    }
};
exports.SLOEngine = SLOEngine;
exports.SLOEngine = SLOEngine = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [MetricsEngine_1.MetricsEngine])
], SLOEngine);
