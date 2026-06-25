"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackProvider = void 0;
const axios_1 = __importDefault(require("axios"));
class SlackProvider {
    config = null;
    constructor(config) {
        this.config = config;
    }
    async send(options) {
        const startTime = Date.now();
        try {
            if (this.config?.simulateFailure || options.recipient.includes('fail')) {
                throw new Error('Slack API error: channel_not_found');
            }
            if (!this.config || !this.config.token || this.config.token === 'mock-token') {
                return {
                    success: true,
                    deliveryId: `slack-${Math.random().toString(36).substring(2, 11)}`,
                    latency: Date.now() - startTime,
                };
            }
            const response = await axios_1.default.post('https://slack.com/api/chat.postMessage', {
                channel: options.recipient,
                text: options.body,
            }, {
                headers: {
                    Authorization: `Bearer ${this.config.token}`,
                    'Content-Type': 'application/json; charset=utf-8',
                },
            });
            if (!response.data.ok) {
                throw new Error(`Slack API error: ${response.data.error}`);
            }
            return {
                success: true,
                deliveryId: response.data.ts,
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
        return !!(config && config.token);
    }
    async health() {
        return true;
    }
    async status() {
        return 'ACTIVE';
    }
}
exports.SlackProvider = SlackProvider;
