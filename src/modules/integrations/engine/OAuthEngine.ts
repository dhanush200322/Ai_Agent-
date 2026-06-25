import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CredentialEngine } from './CredentialEngine';

@Injectable()
export class OAuthEngine {
  private readonly logger = new Logger(OAuthEngine.name);

  constructor(
    private readonly prisma: PrismaClient,
    private readonly credentialEngine: CredentialEngine
  ) {}

  async initialize() {
    this.logger.log('Initializing OAuthEngine...');
  }

  async generateAuthUrl(provider: string, organizationId: string, state: string): Promise<string> {
    // Generate PKCE, nonce, etc.
    return `https://${provider}.com/oauth/authorize?client_id=mock&state=${state}&response_type=code`;
  }

  async handleCallback(provider: string, code: string, state: string, organizationId: string) {
    this.logger.log(`Handling OAuth callback for ${provider} org ${organizationId}`);
    // Validate state, PKCE, nonce, CSRF
    
    // Exchange code for token
    const mockAccessToken = 'mock-access-token';
    const mockRefreshToken = 'mock-refresh-token';

    // Store in Vault
    const vaultKeyAccess = await this.credentialEngine.storeCredential(organizationId, 'oauth-access', mockAccessToken);
    
    let vaultKeyRefresh = null;
    if (mockRefreshToken) {
      vaultKeyRefresh = await this.credentialEngine.storeCredential(organizationId, 'oauth-refresh', mockRefreshToken);
    }

    const connection = await this.prisma.oAuthConnection.create({
      data: {
        organizationId,
        provider,
        clientId: 'mock-client-id',
        clientSecret: 'stored-in-vault', // mock
        status: 'CONNECTED',
      }
    });

    await this.prisma.oAuthToken.create({
      data: {
        connectionId: connection.id,
        accessToken: vaultKeyAccess,
        refreshToken: vaultKeyRefresh,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
      }
    });

    return connection;
  }

  async refreshTokens() {
    this.logger.log('Running OAuth token refresh worker logic');
  }

  async healthCheck() {
    return { status: 'HEALTHY' };
  }
}
