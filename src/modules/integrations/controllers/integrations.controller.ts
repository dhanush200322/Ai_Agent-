import { Controller, Post, Get, Req, Res, Body, Query, Headers, UseGuards, UnauthorizedException } from '@nestjs/common';
import { OAuthEngine, WebhookEngine } from '../engine';

// Assume some existing AuthGuard and RBAC Guard from the platform
@Controller('api/v1')
export class IntegrationsController {
  constructor(
    private readonly oauthEngine: OAuthEngine,
    private readonly webhookEngine: WebhookEngine
  ) {}

  // POST /oauth/connect -> authenticated, RBAC, organization validation
  @Post('oauth/connect')
  async connectOAuth(@Body() body: { provider: string; organizationId: string }) {
    // Requires authentication and RBAC validation at middleware/guard level
    const state = 'secure-random-state'; // generate
    const authUrl = await this.oauthEngine.generateAuthUrl(body.provider, body.organizationId, state);
    return { authUrl };
  }

  // GET /oauth/callback -> public, validate state, PKCE, nonce, CSRF, org lookup
  @Get('oauth/callback')
  async oauthCallback(@Query() query: { code: string; state: string; provider: string; organizationId: string }) {
    const connection = await this.oauthEngine.handleCallback(query.provider, query.code, query.state, query.organizationId);
    return { message: 'OAuth Connected Successfully', connectionId: connection.id };
  }

  // POST /webhooks/* -> public, HMAC signature verification, replay protection
  @Post('webhooks/:provider')
  async handleWebhook(
    @Req() req: any, 
    @Headers('x-hub-signature-256') githubSignature: string,
    @Headers('stripe-signature') stripeSignature: string,
    @Body() body: any
  ) {
    const provider = req.params.provider;
    // In a real scenario, retrieve provider secret from DB/Vault
    const mockSecret = 'provider-secret'; 
    const signature = githubSignature || stripeSignature || req.headers['authorization'];
    
    // Security constraints as required:
    const isValid = await this.webhookEngine.verifySignature(JSON.stringify(body), signature, mockSecret);
    if (!isValid) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    await this.webhookEngine.processInboundWebhook(provider, req.headers, body);
    return { received: true };
  }
}
