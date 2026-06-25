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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingEngine = void 0;
const common_1 = require("@nestjs/common");
const pino_1 = __importDefault(require("pino"));
const CorrelationEngine_1 = require("./CorrelationEngine");
const ObservabilityConfig_1 = require("./ObservabilityConfig");
let LoggingEngine = class LoggingEngine {
    correlationEngine;
    config;
    logger;
    constructor(correlationEngine, config) {
        this.correlationEngine = correlationEngine;
        this.config = config;
        this.logger = (0, pino_1.default)({
            level: this.config.isDevelopment ? 'debug' : 'info',
            transport: this.config.isDevelopment
                ? {
                    target: 'pino-pretty',
                    options: {
                        colorize: true,
                        translateTime: 'SYS:standard',
                    },
                }
                : undefined,
            base: {
                serviceName: this.config.serviceName,
            },
        });
    }
    enrichContext(context) {
        const correlation = this.correlationEngine.getContext();
        return {
            context,
            requestId: correlation?.requestId,
            traceId: this.correlationEngine.getTraceId(),
            spanId: this.correlationEngine.getSpanId(),
            correlationId: correlation?.correlationId,
            organizationId: correlation?.organizationId,
            userId: correlation?.userId,
            timestamp: new Date().toISOString(),
        };
    }
    log(message, context) {
        this.logger.info(this.enrichContext(context), message);
    }
    error(message, trace, context) {
        this.logger.error({ ...this.enrichContext(context), trace }, message);
    }
    warn(message, context) {
        this.logger.warn(this.enrichContext(context), message);
    }
    debug(message, context) {
        this.logger.debug(this.enrichContext(context), message);
    }
    verbose(message, context) {
        this.logger.trace(this.enrichContext(context), message);
    }
};
exports.LoggingEngine = LoggingEngine;
exports.LoggingEngine = LoggingEngine = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [CorrelationEngine_1.CorrelationEngine,
        ObservabilityConfig_1.ObservabilityConfig])
], LoggingEngine);
