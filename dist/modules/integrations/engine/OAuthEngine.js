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
var OAuthEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthEngine = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const CredentialEngine_1 = require("./CredentialEngine");
let OAuthEngine = OAuthEngine_1 = class OAuthEngine {
    prisma;
    credentialEngine;
    logger = new common_1.Logger(OAuthEngine_1.name);
    constructor(prisma, credentialEngine) {
        this.prisma = prisma;
        this.credentialEngine = credentialEngine;
    }
    async initialize() {
        this.logger.log('Initializing OAuthEngine...');
    }
    async generateAuthUrl(provider, organizationId, state) {
        // Generate PKCE, nonce, etc.
        return `https://${provider}.com/oauth/authorize?client_id=mock&state=${state}&response_type=code`;
    }
    async handleCallback(provider, code, state, organizationId) {
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
};
exports.OAuthEngine = OAuthEngine;
exports.OAuthEngine = OAuthEngine = OAuthEngine_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [client_1.PrismaClient,
        CredentialEngine_1.CredentialEngine])
], OAuthEngine);
