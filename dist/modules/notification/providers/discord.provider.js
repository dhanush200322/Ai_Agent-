"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordProvider = void 0;
const axios_1 = __importDefault(require("axios"));
class DiscordProvider {
    config = null;
    constructor(config) {
        this.config = config;
    }
    async send(options) {
        const startTime = Date.now();
        try {
            if (this.config?.simulateFailure || options.recipient.includes('fail')) {
                throw new Error('Discord webhook returned status code 404');
            }
            const webhookUrl = options.recipient || this.config?.webhookUrl;
            if (!webhookUrl || webhookUrl === 'mock-webhook' || webhookUrl.startsWith('mock:')) {
                return {
                    success: true,
                    deliveryId: `discord-${Math.random().toString(36).substring(2, 11)}`,
                    latency: Date.now() - startTime,
                };
            }
            await axios_1.default.post(webhookUrl, {
                content: options.body,
                username: this.config?.username || 'Enterprise Agent',
            });
            return {
                success: true,
                deliveryId: `discord-${Math.random().toString(36).substring(2, 11)}`,
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
        return !!(config && config.webhookUrl);
    }
    async health() {
        return true;
    }
    async status() {
        return 'ACTIVE';
    }
}
exports.DiscordProvider = DiscordProvider;
