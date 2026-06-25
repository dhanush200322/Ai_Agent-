"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorrelationEngine = void 0;
const common_1 = require("@nestjs/common");
const async_hooks_1 = require("async_hooks");
const api_1 = require("@opentelemetry/api");
const crypto_1 = require("crypto");
let CorrelationEngine = class CorrelationEngine {
    als = new async_hooks_1.AsyncLocalStorage();
    run(context, callback) {
        const fullContext = {
            requestId: context.requestId || (0, crypto_1.randomUUID)(),
            correlationId: context.correlationId || (0, crypto_1.randomUUID)(),
            organizationId: context.organizationId,
            userId: context.userId,
        };
        return this.als.run(fullContext, callback);
    }
    getContext() {
        return this.als.getStore();
    }
    getRequestId() {
        return this.getContext()?.requestId;
    }
    getCorrelationId() {
        return this.getContext()?.correlationId;
    }
    getOrganizationId() {
        return this.getContext()?.organizationId;
    }
    getUserId() {
        return this.getContext()?.userId;
    }
    getTraceId() {
        const spanContext = api_1.trace.getSpanContext(api_1.context.active());
        return spanContext?.traceId;
    }
    getSpanId() {
        const spanContext = api_1.trace.getSpanContext(api_1.context.active());
        return spanContext?.spanId;
    }
};
exports.CorrelationEngine = CorrelationEngine;
exports.CorrelationEngine = CorrelationEngine = __decorate([
    (0, common_1.Injectable)()
], CorrelationEngine);
