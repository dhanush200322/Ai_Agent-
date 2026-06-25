"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CircuitBreakerEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerEngine = exports.CircuitState = void 0;
const common_1 = require("@nestjs/common");
var CircuitState;
(function (CircuitState) {
    CircuitState["CLOSED"] = "CLOSED";
    CircuitState["OPEN"] = "OPEN";
    CircuitState["HALF_OPEN"] = "HALF_OPEN";
})(CircuitState || (exports.CircuitState = CircuitState = {}));
let CircuitBreakerEngine = CircuitBreakerEngine_1 = class CircuitBreakerEngine {
    logger = new common_1.Logger(CircuitBreakerEngine_1.name);
    states = new Map();
    async execute(serviceName, action, threshold = 5, timeoutMs = 30000) {
        const record = this.states.get(serviceName) || { state: CircuitState.CLOSED, failures: 0, nextAttempt: 0 };
        if (record.state === CircuitState.OPEN) {
            if (Date.now() < record.nextAttempt) {
                throw new Error(`Circuit for ${serviceName} is OPEN`);
            }
            record.state = CircuitState.HALF_OPEN;
        }
        try {
            const result = await action();
            if (record.state === CircuitState.HALF_OPEN) {
                record.state = CircuitState.CLOSED;
                record.failures = 0;
            }
            this.states.set(serviceName, record);
            return result;
        }
        catch (err) {
            record.failures++;
            if (record.failures >= threshold) {
                record.state = CircuitState.OPEN;
                record.nextAttempt = Date.now() + timeoutMs;
                this.logger.warn(`Circuit Breaker TRIPPED for ${serviceName}`);
            }
            this.states.set(serviceName, record);
            throw err;
        }
    }
};
exports.CircuitBreakerEngine = CircuitBreakerEngine;
exports.CircuitBreakerEngine = CircuitBreakerEngine = CircuitBreakerEngine_1 = __decorate([
    (0, common_1.Injectable)()
], CircuitBreakerEngine);
