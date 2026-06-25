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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WebhookEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookEngine = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const crypto = __importStar(require("crypto"));
let WebhookEngine = WebhookEngine_1 = class WebhookEngine {
    prisma;
    logger = new common_1.Logger(WebhookEngine_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async initialize() {
        this.logger.log('Initializing WebhookEngine...');
    }
    async verifySignature(payload, signature, secret) {
        const hmac = crypto.createHmac('sha256', secret);
        const digest = hmac.update(payload).digest('hex');
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
    }
    async processInboundWebhook(provider, headers, body) {
        this.logger.log(`Processing inbound webhook for ${provider}`);
        // Extract timestamp, signature
        // Replay protection: check timestamp is within 5 minutes
        // Validate signature
        // Store as ExternalEvent for processing
        return { status: 'RECEIVED' };
    }
    async dispatchOutboundWebhook(subscriptionId, eventName, payload) {
        this.logger.log(`Dispatching outbound webhook to ${subscriptionId}`);
        // Queue to BullMQ with retries and DLQ
    }
    async healthCheck() {
        return { status: 'HEALTHY' };
    }
};
exports.WebhookEngine = WebhookEngine;
exports.WebhookEngine = WebhookEngine = WebhookEngine_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [client_1.PrismaClient])
], WebhookEngine);
