"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SESProvider = void 0;
class SESProvider {
    config = null;
    constructor(config) {
        this.config = config;
    }
    async send(options) {
        const startTime = Date.now();
        try {
            if (this.config?.simulateFailure || options.recipient.includes('fail')) {
                throw new Error('SES service unavailable or sandbox restriction');
            }
            return {
                success: true,
                deliveryId: `ses-${Math.random().toString(36).substring(2, 11)}`,
                latency: Date.now() - startTime,
            };
        }
        catch (error) {
            return {
                success: false,
                errorMessage: error.message,
                latency: Date.now() - startTime,
            };
        }
    }
    validate(config) {
        return !!(config && config.region && config.accessKeyId);
    }
    async health() {
        return true;
    }
    async status() {
        return 'ACTIVE';
    }
}
exports.SESProvider = SESProvider;
