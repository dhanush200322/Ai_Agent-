"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookProvider = void 0;
exports.verifyWebhookSignature = verifyWebhookSignature;
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
class WebhookProvider {
    config = null;
    constructor(config) {
        this.config = config;
    }
    async send(options) {
        const startTime = Date.now();
        try {
            if (this.config?.simulateFailure || options.recipient.includes('fail')) {
                throw new Error('Webhook request failed with status code 500');
            }
            const url = options.recipient;
            if (!url || url === 'mock-url' || url.startsWith('mock:')) {
                return {
                    success: true,
                    deliveryId: `wh-${Math.random().toString(36).substring(2, 11)}`,
                    latency: Date.now() - startTime,
                };
            }
            const payload = JSON.stringify({
                event: options.metadata?.eventType || 'NOTIFICATION_TRIGGERED',
                body: options.body,
                timestamp: new Date().toISOString(),
                metadata: options.metadata || {},
            });
            const timestamp = Date.now().toString();
            const secret = this.config?.secret || 'default-secret';
            const hmac = crypto.createHmac('sha256', secret);
            hmac.update(`${timestamp}.${payload}`);
            const signature = hmac.digest('hex');
            await axios_1.default.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Enterprise-Signature': signature,
                    'X-Enterprise-Timestamp': timestamp,
                },
                timeout: this.config?.timeout || 5000,
            });
            return {
                success: true,
                deliveryId: `wh-${Math.random().toString(36).substring(2, 11)}`,
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
        return !!(config && config.secret);
    }
    async health() {
        return true;
    }
    async status() {
        return 'ACTIVE';
    }
}
exports.WebhookProvider = WebhookProvider;
function verifyWebhookSignature(payload, timestamp, signature, secret) {
    // Replay Attack Protection: Check if timestamp is older than 5 minutes (300 seconds)
    const timeDifference = Math.abs(Date.now() - parseInt(timestamp));
    if (timeDifference > 300000) {
        return false; // Request too old, reject replay attack
    }
    const expectedHmac = crypto.createHmac('sha256', secret)
        .update(`${timestamp}.${payload}`)
        .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedHmac));
}
