import { Controller, Get, Post, Body, Param, Req, Res, Headers } from '@nestjs/common';
import { 
  GatewayEngine, ApiKeyEngine, OAuthEngine, SdkEngine, 
  DocumentationEngine, DeveloperPortalEngine, WebhookEngine 
} from '../engine';

@Controller('api/v1')
export class ApiGatewayController {
  constructor(
    private readonly gatewayEngine: GatewayEngine,
    private readonly apiKeyEngine: ApiKeyEngine,
    private readonly oauthEngine: OAuthEngine,
    private readonly sdkEngine: SdkEngine,
    private readonly docsEngine: DocumentationEngine,
    private readonly portalEngine: DeveloperPortalEngine,
    private readonly webhookEngine: WebhookEngine
  ) {}

  @Get('gateway/routes')
  async getRoutes() {
    return { routes: [] }; // In real implementation, returns routes from gateway engine
  }

  @Post('apikeys')
  async generateApiKey(@Body() body: { developerApplicationId: string, organizationId: string }) {
    return this.apiKeyEngine.generateDeveloperKey(body.developerApplicationId, body.organizationId);
  }

  @Get('sdk/:language')
  async generateSdk(@Param('language') language: string) {
    const outputDir = `./sdk-output/${language}`;
    // Assuming openapi spec is saved locally
    return this.sdkEngine.generateSdk(language, './openapi.json', outputDir);
  }

  @Get('openapi')
  async getOpenApi() {
    return this.docsEngine.getOpenApiSpec();
  }

  @Get('developer/:id/dashboard')
  async getDeveloperDashboard(@Param('id') id: string) {
    return this.portalEngine.getDeveloperDashboard(id);
  }

  @Post('webhooks/test')
  async testWebhook(@Body() body: { applicationId: string, payload: any }) {
    await this.webhookEngine.dispatchWebhook(body.applicationId, 'ping', body.payload);
    return { status: 'DISPATCHED' };
  }
}
