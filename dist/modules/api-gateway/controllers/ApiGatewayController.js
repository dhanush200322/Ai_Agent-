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
exports.ApiGatewayController = void 0;
const common_1 = require("@nestjs/common");
const engine_1 = require("../engine");
let ApiGatewayController = class ApiGatewayController {
    gatewayEngine;
    apiKeyEngine;
    oauthEngine;
    sdkEngine;
    docsEngine;
    portalEngine;
    webhookEngine;
    constructor(gatewayEngine, apiKeyEngine, oauthEngine, sdkEngine, docsEngine, portalEngine, webhookEngine) {
        this.gatewayEngine = gatewayEngine;
        this.apiKeyEngine = apiKeyEngine;
        this.oauthEngine = oauthEngine;
        this.sdkEngine = sdkEngine;
        this.docsEngine = docsEngine;
        this.portalEngine = portalEngine;
        this.webhookEngine = webhookEngine;
    }
    async getRoutes() {
        return { routes: [] }; // In real implementation, returns routes from gateway engine
    }
    async generateApiKey(body) {
        return this.apiKeyEngine.generateDeveloperKey(body.developerApplicationId, body.organizationId);
    }
    async generateSdk(language) {
        const outputDir = `./sdk-output/${language}`;
        // Assuming openapi spec is saved locally
        return this.sdkEngine.generateSdk(language, './openapi.json', outputDir);
    }
    async getOpenApi() {
        return this.docsEngine.getOpenApiSpec();
    }
    async getDeveloperDashboard(id) {
        return this.portalEngine.getDeveloperDashboard(id);
    }
    async testWebhook(body) {
        await this.webhookEngine.dispatchWebhook(body.applicationId, 'ping', body.payload);
        return { status: 'DISPATCHED' };
    }
};
exports.ApiGatewayController = ApiGatewayController;
__decorate([
    (0, common_1.Get)('gateway/routes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "getRoutes", null);
__decorate([
    (0, common_1.Post)('apikeys'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "generateApiKey", null);
__decorate([
    (0, common_1.Get)('sdk/:language'),
    __param(0, (0, common_1.Param)('language')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "generateSdk", null);
__decorate([
    (0, common_1.Get)('openapi'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "getOpenApi", null);
__decorate([
    (0, common_1.Get)('developer/:id/dashboard'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "getDeveloperDashboard", null);
__decorate([
    (0, common_1.Post)('webhooks/test'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "testWebhook", null);
exports.ApiGatewayController = ApiGatewayController = __decorate([
    (0, common_1.Controller)('api/v1'),
    __metadata("design:paramtypes", [engine_1.GatewayEngine,
        engine_1.ApiKeyEngine,
        engine_1.OAuthEngine,
        engine_1.SdkEngine,
        engine_1.DocumentationEngine,
        engine_1.DeveloperPortalEngine,
        engine_1.WebhookEngine])
], ApiGatewayController);
