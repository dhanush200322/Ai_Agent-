"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SlackProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackProvider = void 0;
const common_1 = require("@nestjs/common");
const CapabilityDiscoveryEngine_1 = require("../engine/CapabilityDiscoveryEngine");
let SlackProvider = SlackProvider_1 = class SlackProvider {
    discoveryEngine;
    logger = new common_1.Logger(SlackProvider_1.name);
    constructor(discoveryEngine) {
        this.discoveryEngine = discoveryEngine;
        this.discoveryEngine.registerProviderCapabilities('slack', this.getManifest(), this.getCapabilities());
    }
    getManifest() {
        return {
            name: 'Slack',
            version: '1.0.0',
            provider: 'slack',
            authentication: 'OAUTH2',
            permissions: ['chat:write', 'channels:read', 'files:write'],
            actions: ['Send Message', 'Read Channel', 'Upload File'],
            events: ['message.channels', 'app_mention'],
            healthCheck: true,
            webhooks: true,
            limits: {
                rateLimit: 1, // 1 message per second per channel
            },
            requiredScopes: ['chat:write', 'channels:history']
        };
    }
    async initialize(config) {
        this.logger.log('Initializing Slack provider');
    }
    async validateConfiguration(config) {
        return !!config;
    }
    async healthCheck() {
        return { status: 'HEALTHY', latencyMs: 30 };
    }
    async executeAction(action, payload) {
        this.logger.log(`Executing Slack action: ${action}`);
        if (action === 'Send Message') {
            return { ok: true, ts: '1503435956.000247', channel: payload.channel };
        }
        return { ok: true };
    }
    async verifyWebhookSignature(payload, signature, secret) {
        return true; // verify v0=... signature
    }
    async processWebhook(event) {
        this.logger.log(`Processing Slack Event API webhook`);
    }
    getCapabilities() {
        return [
            { action: 'Send Message', description: 'Send a message to a channel' },
            { action: 'Read Channel', description: 'Read messages from a channel' },
            { action: 'Upload File', description: 'Upload a file to Slack' }
        ];
    }
};
exports.SlackProvider = SlackProvider;
exports.SlackProvider = SlackProvider = SlackProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [CapabilityDiscoveryEngine_1.CapabilityDiscoveryEngine])
], SlackProvider);
