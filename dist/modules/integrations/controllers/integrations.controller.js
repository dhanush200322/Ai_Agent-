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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsController = void 0;
const common_1 = require("@nestjs/common");
const engine_1 = require("../engine");
// Assume some existing AuthGuard and RBAC Guard from the platform
let IntegrationsController = class IntegrationsController {
    oauthEngine;
    webhookEngine;
    constructor(oauthEngine, webhookEngine) {
        this.oauthEngine = oauthEngine;
        this.webhookEngine = webhookEngine;
    }
    // POST /oauth/connect -> authenticated, RBAC, organization validation
    async connectOAuth(body) {
        // Requires authentication and RBAC validation at middleware/guard level
        const state = 'secure-random-state'; // generate
        const authUrl = await this.oauthEngine.generateAuthUrl(body.provider, body.organizationId, state);
        return { authUrl };
    }
    // GET /oauth/callback -> public, validate state, PKCE, nonce, CSRF, org lookup
    async oauthCallback(query) {
        const connection = await this.oauthEngine.handleCallback(query.provider, query.code, query.state, query.organizationId);
        return { message: 'OAuth Connected Successfully', connectionId: connection.id };
    }
    // POST /webhooks/* -> public, HMAC signature verification, replay protection
    async handleWebhook(req, githubSignature, stripeSignature, body) {
        const provider = req.params.provider;
        // In a real scenario, retrieve provider secret from DB/Vault
        const mockSecret = 'provider-secret';
        const signature = githubSignature || stripeSignature || req.headers['authorization'];
        // Security constraints as required:
        const isValid = await this.webhookEngine.verifySignature(JSON.stringify(body), signature, mockSecret);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid webhook signature');
        }
        await this.webhookEngine.processInboundWebhook(provider, req.headers, body);
        return { received: true };
    }
};
exports.IntegrationsController = IntegrationsController;
__decorate([
    (0, common_1.Post)('oauth/connect'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "connectOAuth", null);
__decorate([
    (0, common_1.Get)('oauth/callback'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "oauthCallback", null);
__decorate([
    (0, common_1.Post)('webhooks/:provider'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('x-hub-signature-256')),
    __param(2, (0, common_1.Headers)('stripe-signature')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "handleWebhook", null);
exports.IntegrationsController = IntegrationsController = __decorate([
    (0, common_1.Controller)('api/v1'),
    __metadata("design:paramtypes", [engine_1.OAuthEngine,
        engine_1.WebhookEngine])
], IntegrationsController);
