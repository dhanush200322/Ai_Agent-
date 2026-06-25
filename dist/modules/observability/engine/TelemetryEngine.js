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
exports.TelemetryEngine = void 0;
const common_1 = require("@nestjs/common");
const LoggingEngine_1 = require("./LoggingEngine");
const CorrelationEngine_1 = require("./CorrelationEngine");
const TracingEngine_1 = require("./TracingEngine");
const api_1 = require("@opentelemetry/api");
let TelemetryEngine = class TelemetryEngine {
    logger;
    correlationEngine;
    tracingEngine;
    constructor(logger, correlationEngine, tracingEngine) {
        this.logger = logger;
        this.correlationEngine = correlationEngine;
        this.tracingEngine = tracingEngine;
    }
    trackEvent(event) {
        this.logger.log(`Telemetry Event: ${event.name}`, 'TelemetryEngine');
        const tracer = this.tracingEngine.getTracer();
        tracer.startActiveSpan(`event:${event.name}`, (span) => {
            if (event.attributes) {
                span.setAttributes(event.attributes);
            }
            span.addEvent(event.name, event.attributes);
            span.end();
        });
    }
    trackError(error, attributes) {
        this.logger.error(`Telemetry Error: ${error.message}`, error.stack, 'TelemetryEngine');
        const tracer = this.tracingEngine.getTracer();
        tracer.startActiveSpan('error_capture', (span) => {
            span.setStatus({ code: api_1.SpanStatusCode.ERROR, message: error.message });
            span.recordException(error);
            if (attributes) {
                span.setAttributes(attributes);
            }
            span.end();
        });
    }
};
exports.TelemetryEngine = TelemetryEngine;
exports.TelemetryEngine = TelemetryEngine = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [LoggingEngine_1.LoggingEngine,
        CorrelationEngine_1.CorrelationEngine,
        TracingEngine_1.TracingEngine])
], TelemetryEngine);
