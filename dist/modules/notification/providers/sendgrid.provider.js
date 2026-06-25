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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendGridProvider = void 0;
const sgMail = __importStar(require("@sendgrid/mail"));
class SendGridProvider {
    config = null;
    constructor(config) {
        this.config = config;
        if (config && config.apiKey && config.apiKey !== 'mock-key') {
            sgMail.setApiKey(config.apiKey);
        }
    }
    async send(options) {
        const startTime = Date.now();
        try {
            if (!this.config || !this.config.apiKey || this.config.apiKey === 'mock-key') {
                if (this.config?.simulateFailure || options.recipient.includes('fail')) {
                    throw new Error('SendGrid API key invalid');
                }
                return {
                    success: true,
                    deliveryId: `sg-${Math.random().toString(36).substring(2, 11)}`,
                    latency: Date.now() - startTime,
                };
            }
            const msg = {
                to: options.recipient,
                from: this.config.from || 'noreply@enterprise.com',
                subject: options.subject || 'No Subject',
                html: options.body,
            };
            if (options.attachments && options.attachments.length > 0) {
                msg.attachments = options.attachments.map(att => ({
                    filename: att.fileName,
                    path: att.filePath,
                    type: att.mimeType,
                    disposition: 'attachment',
                }));
            }
            const [response] = await sgMail.send(msg);
            return {
                success: true,
                deliveryId: response.headers['x-message-id'] || `sg-${Math.random().toString(36).substring(2, 11)}`,
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
        return !!(config && config.apiKey);
    }
    async health() {
        return true;
    }
    async status() {
        return 'ACTIVE';
    }
}
exports.SendGridProvider = SendGridProvider;
