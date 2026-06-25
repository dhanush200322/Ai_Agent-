"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiGatewayModule = void 0;
const common_1 = require("@nestjs/common");
const ApiGatewayController_1 = require("./controllers/ApiGatewayController");
const engine_1 = require("./engine");
const middleware_1 = require("./middleware");
let ApiGatewayModule = class ApiGatewayModule {
    configure(consumer) {
        consumer
            .apply(middleware_1.CorrelationMiddleware, middleware_1.RequestLoggingMiddleware, middleware_1.RateLimitMiddleware, middleware_1.GatewayAuthMiddleware)
            .forRoutes({ path: 'api/v1/gateway/*', method: common_1.RequestMethod.ALL });
    }
};
exports.ApiGatewayModule = ApiGatewayModule;
exports.ApiGatewayModule = ApiGatewayModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        controllers: [ApiGatewayController_1.ApiGatewayController],
        providers: [
            engine_1.GatewayEngine, engine_1.VersionEngine, engine_1.ApiKeyEngine, engine_1.OAuthEngine, engine_1.SdkEngine,
            engine_1.DocumentationEngine, engine_1.DeveloperPortalEngine, engine_1.AnalyticsEngine, engine_1.RateLimitEngine,
            engine_1.WebhookEngine, engine_1.CacheEngine, engine_1.PolicyEngine, engine_1.TransformationEngine, engine_1.CircuitBreakerEngine
        ],
        exports: [
            engine_1.GatewayEngine, engine_1.VersionEngine, engine_1.ApiKeyEngine, engine_1.OAuthEngine, engine_1.SdkEngine,
            engine_1.DocumentationEngine, engine_1.DeveloperPortalEngine, engine_1.AnalyticsEngine, engine_1.RateLimitEngine,
            engine_1.WebhookEngine, engine_1.CacheEngine, engine_1.PolicyEngine, engine_1.TransformationEngine, engine_1.CircuitBreakerEngine
        ]
    })
], ApiGatewayModule);
