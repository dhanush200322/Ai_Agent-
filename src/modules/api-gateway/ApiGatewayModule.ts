import { Module, Global, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ApiGatewayController } from './controllers/ApiGatewayController';
import { 
  GatewayEngine, VersionEngine, ApiKeyEngine, OAuthEngine, SdkEngine, 
  DocumentationEngine, DeveloperPortalEngine, AnalyticsEngine, RateLimitEngine, 
  WebhookEngine, CacheEngine, PolicyEngine, TransformationEngine, CircuitBreakerEngine 
} from './engine';
import { 
  GatewayAuthMiddleware, RateLimitMiddleware, CorrelationMiddleware, RequestLoggingMiddleware 
} from './middleware';

@Global()
@Module({
  controllers: [ApiGatewayController],
  providers: [
    GatewayEngine, VersionEngine, ApiKeyEngine, OAuthEngine, SdkEngine,
    DocumentationEngine, DeveloperPortalEngine, AnalyticsEngine, RateLimitEngine,
    WebhookEngine, CacheEngine, PolicyEngine, TransformationEngine, CircuitBreakerEngine
  ],
  exports: [
    GatewayEngine, VersionEngine, ApiKeyEngine, OAuthEngine, SdkEngine,
    DocumentationEngine, DeveloperPortalEngine, AnalyticsEngine, RateLimitEngine,
    WebhookEngine, CacheEngine, PolicyEngine, TransformationEngine, CircuitBreakerEngine
  ]
})
export class ApiGatewayModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationMiddleware, RequestLoggingMiddleware, RateLimitMiddleware, GatewayAuthMiddleware)
      .forRoutes({ path: 'api/v1/gateway/*', method: RequestMethod.ALL });
  }
}
