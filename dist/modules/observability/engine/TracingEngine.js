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
var TracingEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TracingEngine = void 0;
const common_1 = require("@nestjs/common");
const sdk_trace_node_1 = require("@opentelemetry/sdk-trace-node");
const sdk_trace_node_2 = require("@opentelemetry/sdk-trace-node");
const api_1 = require("@opentelemetry/api");
const ObservabilityConfig_1 = require("./ObservabilityConfig");
let TracingEngine = TracingEngine_1 = class TracingEngine {
    config;
    logger = new common_1.Logger(TracingEngine_1.name);
    provider;
    tracer;
    constructor(config) {
        this.config = config;
    }
    onModuleInit() {
        this.provider = new sdk_trace_node_1.NodeTracerProvider({
            spanProcessors: [
                new sdk_trace_node_2.SimpleSpanProcessor(new sdk_trace_node_2.ConsoleSpanExporter())
            ]
        });
        if (this.config.otlpEndpoint) {
            this.logger.log(`Configured OTLP Trace Exporter at ${this.config.otlpEndpoint}`);
        }
        else {
            this.logger.log('Configured Console Trace Exporter');
        }
        this.provider.register();
        this.tracer = api_1.trace.getTracer(this.config.serviceName);
    }
    async onModuleDestroy() {
        if (this.provider) {
            await this.provider.shutdown();
        }
    }
    getTracer() {
        return this.tracer;
    }
    async trace(name, fn, attributes) {
        return this.tracer.startActiveSpan(name, async (span) => {
            if (attributes) {
                span.setAttributes(attributes);
            }
            try {
                const result = await fn(span);
                span.setStatus({ code: api_1.SpanStatusCode.OK });
                return result;
            }
            catch (error) {
                span.setStatus({ code: api_1.SpanStatusCode.ERROR, message: error.message });
                span.recordException(error);
                throw error;
            }
            finally {
                span.end();
            }
        });
    }
};
exports.TracingEngine = TracingEngine;
exports.TracingEngine = TracingEngine = TracingEngine_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ObservabilityConfig_1.ObservabilityConfig])
], TracingEngine);
