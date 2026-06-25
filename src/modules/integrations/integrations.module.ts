import { Module, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import {
  CapabilityDiscoveryEngine,
  ConnectorEngine,
  CredentialEngine,
  IntegrationEngine,
  MarketplaceEngine,
  MonitoringEngine,
  OAuthEngine,
  PluginEngine,
  PolicyEngine,
  SandboxEngine,
  SchedulerEngine,
  SynchronizationEngine,
  WebhookEngine,
} from './engine';

import {
  GitHubProvider,
  SlackProvider,
  GoogleDriveProvider,
  StripeProvider,
} from './providers';

@Module({
  providers: [
    PrismaClient, // in reality, should be imported from a DatabaseModule
    
    // Engines
    CapabilityDiscoveryEngine,
    SandboxEngine,
    CredentialEngine,
    PolicyEngine,
    ConnectorEngine,
    PluginEngine,
    MarketplaceEngine,
    OAuthEngine,
    WebhookEngine,
    SchedulerEngine,
    SynchronizationEngine,
    MonitoringEngine,
    IntegrationEngine,
    
    // Providers
    GitHubProvider,
    SlackProvider,
    GoogleDriveProvider,
    StripeProvider,
  ],
  exports: [
    IntegrationEngine,
    ConnectorEngine,
    PluginEngine,
    OAuthEngine,
    WebhookEngine
  ]
})
export class IntegrationsModule implements OnModuleInit {
  constructor(
    private readonly integrationEngine: IntegrationEngine,
    private readonly connectorEngine: ConnectorEngine,
    private readonly githubProvider: GitHubProvider,
    private readonly slackProvider: SlackProvider,
    private readonly googleDriveProvider: GoogleDriveProvider,
    private readonly stripeProvider: StripeProvider
  ) {}

  async onModuleInit() {
    // Register providers
    this.connectorEngine.registerProvider('github', this.githubProvider);
    this.connectorEngine.registerProvider('slack', this.slackProvider);
    this.connectorEngine.registerProvider('google_drive', this.googleDriveProvider);
    this.connectorEngine.registerProvider('stripe', this.stripeProvider);

    // Initialize the engine platform
    await this.integrationEngine.initialize();
  }
}
