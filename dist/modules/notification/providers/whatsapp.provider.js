"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppBusinessProvider = void 0;
class WhatsAppBusinessProvider {
    config = null;
    constructor(config) {
        this.config = config;
    }
    async send(options) {
        const startTime = Date.now();
        try {
            if (this.config?.simulateFailure || options.recipient.includes('fail')) {
                throw new Error('WhatsApp service: Template not registered or permission denied');
            }
            return {
                success: true,
                deliveryId: `wa-${Math.random().toString(36).substring(2, 11)}`,
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
        return !!(config && config.phoneNumberId && config.accessToken);
    }
    async health() {
        return true;
    }
    async status() {
        return 'ACTIVE';
    }
}
exports.WhatsAppBusinessProvider = WhatsAppBusinessProvider;
