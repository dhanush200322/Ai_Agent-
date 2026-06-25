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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var WebhookEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookEngine = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const crypto = __importStar(require("crypto"));
const axios_1 = __importDefault(require("axios"));
let WebhookEngine = WebhookEngine_1 = class WebhookEngine {
    logger = new common_1.Logger(WebhookEngine_1.name);
    prisma = new client_1.PrismaClient();
    async dispatchWebhook(applicationId, event, payload) {
        this.logger.debug(`Dispatching webhook for app ${applicationId}, event ${event}`);
        const webhooks = await this.prisma.apiWebhook.findMany({
            where: { applicationId, status: 'ACTIVE' }
        });
        for (const webhook of webhooks) {
            if (webhook.events.includes('*') || webhook.events.includes(event)) {
                await this.sendPayload(webhook, event, payload);
            }
        }
    }
    async sendPayload(webhook, event, payload) {
        const signature = crypto.createHmac('sha256', webhook.secret)
            .update(JSON.stringify(payload))
            .digest('hex');
        try {
            const response = await axios_1.default.post(webhook.url, payload, {
                headers: {
                    'x-webhook-signature': signature,
                    'x-webhook-event': event,
                    'x-webhook-timestamp': Date.now().toString()
                }
            });
            await this.prisma.apiWebhookDelivery.create({
                data: {
                    webhookId: webhook.id,
                    eventId: event,
                    payload,
                    statusCode: response.status,
                    status: 'SUCCESS'
                }
            });
        }
        catch (error) {
            this.logger.error(`Webhook delivery failed for ${webhook.id}`, error);
            await this.prisma.apiWebhookDelivery.create({
                data: {
                    webhookId: webhook.id,
                    eventId: event,
                    payload,
                    statusCode: error.response?.status || 500,
                    status: 'FAILED',
                    error: error.message
                }
            });
            // Further DLQ/Retry logic goes here (managed by worker)
        }
    }
};
exports.WebhookEngine = WebhookEngine;
exports.WebhookEngine = WebhookEngine = WebhookEngine_1 = __decorate([
    (0, common_1.Injectable)()
], WebhookEngine);
