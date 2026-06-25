"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryEngine = void 0;
class RetryEngine {
    calculateBackoff(attempt, baseDelayMs = 1000, factor = 2) {
        return baseDelayMs * Math.pow(factor, attempt);
    }
}
exports.RetryEngine = RetryEngine;
