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
var MetricsWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsWorker = void 0;
const common_1 = require("@nestjs/common");
const MetricsEngine_1 = require("../engine/MetricsEngine");
let MetricsWorker = MetricsWorker_1 = class MetricsWorker {
    metricsEngine;
    logger = new common_1.Logger(MetricsWorker_1.name);
    constructor(metricsEngine) {
        this.metricsEngine = metricsEngine;
        this.startPeriodicSync();
    }
    startPeriodicSync() {
        setInterval(() => {
            this.logger.debug('Syncing metrics to persistence (if enabled)');
            // In a real environment, Prometheus scrapes /metrics.
            // If pushing is needed (e.g., Pushgateway), we'd implement that here.
        }, 60000);
    }
};
exports.MetricsWorker = MetricsWorker;
exports.MetricsWorker = MetricsWorker = MetricsWorker_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [MetricsEngine_1.MetricsEngine])
], MetricsWorker);
