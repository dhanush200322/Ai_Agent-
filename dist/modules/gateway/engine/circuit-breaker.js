"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreaker = void 0;
class CircuitBreaker {
    threshold;
    resetTimeoutMs;
    failures = 0;
    state = 'CLOSED';
    lastFailureTime = 0;
    constructor(threshold = 5, resetTimeoutMs = 30000) {
        this.threshold = threshold;
        this.resetTimeoutMs = resetTimeoutMs;
    }
    async execute(action) {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
                this.state = 'HALF_OPEN';
            }
            else {
                throw new Error('Circuit Breaker OPEN: Fast failing request');
            }
        }
        try {
            const result = await action();
            this.onSuccess();
            return result;
        }
        catch (e) {
            this.onFailure();
            throw e;
        }
    }
    onSuccess() {
        this.failures = 0;
        this.state = 'CLOSED';
    }
    onFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();
        if (this.failures >= this.threshold) {
            this.state = 'OPEN';
        }
    }
}
exports.CircuitBreaker = CircuitBreaker;
