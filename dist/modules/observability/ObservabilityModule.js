"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservabilityModule = void 0;
const common_1 = require("@nestjs/common");
const engine_1 = require("./engine");
const ObservabilityController_1 = require("./controllers/ObservabilityController");
const TracingMiddleware_1 = require("./middleware/TracingMiddleware");
let ObservabilityModule = class ObservabilityModule {
    configure(consumer) {
        consumer
            .apply(TracingMiddleware_1.TracingMiddleware)
            .forRoutes({ path: '*', method: common_1.RequestMethod.ALL });
    }
};
exports.ObservabilityModule = ObservabilityModule;
exports.ObservabilityModule = ObservabilityModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        controllers: [ObservabilityController_1.ObservabilityController],
        providers: [
            engine_1.ObservabilityConfig,
            engine_1.CorrelationEngine,
            engine_1.TracingEngine,
            engine_1.LoggingEngine,
            engine_1.TelemetryEngine,
            engine_1.MetricsEngine,
            engine_1.SLOEngine,
            engine_1.HealthEngine,
            engine_1.AlertEngine,
            engine_1.ProfilingEngine,
            engine_1.PerformanceEngine,
            engine_1.DashboardEngine,
            engine_1.AnalyticsEngine
        ],
        exports: [
            engine_1.CorrelationEngine,
            engine_1.TracingEngine,
            engine_1.LoggingEngine,
            engine_1.TelemetryEngine,
            engine_1.MetricsEngine,
            engine_1.SLOEngine,
            engine_1.HealthEngine,
            engine_1.AlertEngine,
            engine_1.ProfilingEngine,
            engine_1.PerformanceEngine,
            engine_1.DashboardEngine,
            engine_1.AnalyticsEngine
        ]
    })
], ObservabilityModule);
