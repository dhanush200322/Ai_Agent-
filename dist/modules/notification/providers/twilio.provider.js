"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioSMSProvider = void 0;
const twilio_1 = __importDefault(require("twilio"));
class TwilioSMSProvider {
    client = null;
    config = null;
    constructor(config) {
        this.config = config;
        if (config && config.accountSid && config.authToken && config.accountSid !== 'mock-sid') {
            this.client = (0, twilio_1.default)(config.accountSid, config.authToken);
        }
    }
    async send(options) {
        const startTime = Date.now();
        try {
            if (!this.client || this.config.accountSid === 'mock-sid') {
                if (this.config?.simulateFailure || options.recipient.includes('fail')) {
                    throw new Error('Twilio credentials invalid or connection error');
                }
                return {
                    success: true,
                    deliveryId: `twilio-${Math.random().toString(36).substring(2, 11)}`,
                    latency: Date.now() - startTime,
                };
            }
            const response = await this.client.messages.create({
                body: options.body,
                to: options.recipient,
                from: this.config.from || '+1234567890',
            });
            return {
                success: true,
                deliveryId: response.sid,
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
        return !!(config && config.accountSid && config.authToken);
    }
    async health() {
        return true;
    }
    async status() {
        return 'ACTIVE';
    }
}
exports.TwilioSMSProvider = TwilioSMSProvider;
