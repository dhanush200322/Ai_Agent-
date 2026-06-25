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
exports.TracingMiddleware = void 0;
const common_1 = require("@nestjs/common");
const CorrelationEngine_1 = require("../engine/CorrelationEngine");
const PerformanceEngine_1 = require("../engine/PerformanceEngine");
const TracingEngine_1 = require("../engine/TracingEngine");
const TelemetryEngine_1 = require("../engine/TelemetryEngine");
const api_1 = require("@opentelemetry/api");
let TracingMiddleware = class TracingMiddleware {
    correlationEngine;
    performanceEngine;
    tracingEngine;
    telemetryEngine;
    constructor(correlationEngine, performanceEngine, tracingEngine, telemetryEngine) {
        this.correlationEngine = correlationEngine;
        this.performanceEngine = performanceEngine;
        this.tracingEngine = tracingEngine;
        this.telemetryEngine = telemetryEngine;
    }
    use(req, res, next) {
        const requestId = req.headers['x-request-id'] || undefined;
        const correlationId = req.headers['x-correlation-id'] || undefined;
        const organizationId = req.headers['x-organization-id'] || undefined;
        this.correlationEngine.run({ requestId, correlationId, organizationId }, () => {
            const tracer = this.tracingEngine.getTracer();
            const startTime = Date.now();
            tracer.startActiveSpan(`${req.method} ${req.path}`, (span) => {
                span.setAttributes({
                    'http.method': req.method,
                    'http.url': req.url,
                    'http.route': req.path,
                    'http.user_agent': req.headers['user-agent'] || '',
                });
                res.on('finish', () => {
                    const duration = Date.now() - startTime;
                    span.setAttribute('http.status_code', res.statusCode);
                    if (res.statusCode >= 400) {
                        span.setStatus({ code: api_1.SpanStatusCode.ERROR });
                        this.performanceEngine.trackErrorRate('API', req.path);
                    }
                    else {
                        span.setStatus({ code: api_1.SpanStatusCode.OK });
                    }
                    this.performanceEngine.trackLatency('API', req.path, duration);
                    this.performanceEngine.trackThroughput('API', req.path);
                    this.telemetryEngine.trackEvent({
                        name: 'http_request_completed',
                        category: 'api',
                        attributes: {
                            path: req.path,
                            method: req.method,
                            statusCode: res.statusCode,
                            durationMs: duration
                        }
                    });
                    span.end();
                });
                next();
            });
        });
    }
};
exports.TracingMiddleware = TracingMiddleware;
exports.TracingMiddleware = TracingMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [CorrelationEngine_1.CorrelationEngine,
        PerformanceEngine_1.PerformanceEngine,
        TracingEngine_1.TracingEngine,
        TelemetryEngine_1.TelemetryEngine])
], TracingMiddleware);
