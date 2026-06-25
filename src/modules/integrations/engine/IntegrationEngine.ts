import { Injectable, Logger } from '@nestjs/common';
import { ConnectorEngine } from './ConnectorEngine';
import { PluginEngine } from './PluginEngine';
import { MarketplaceEngine } from './MarketplaceEngine';
import { CapabilityDiscoveryEngine } from './CapabilityDiscoveryEngine';
import { OAuthEngine } from './OAuthEngine';
import { WebhookEngine } from './WebhookEngine';
import { SchedulerEngine } from './SchedulerEngine';
import { SynchronizationEngine } from './SynchronizationEngine';
import { CredentialEngine } from './CredentialEngine';
import { SandboxEngine } from './SandboxEngine';
import { MonitoringEngine } from './MonitoringEngine';
import { PolicyEngine } from './PolicyEngine';

@Injectable()
export class IntegrationEngine {
  private readonly logger = new Logger(IntegrationEngine.name);

  constructor(
    public readonly connectorEngine: ConnectorEngine,
    public readonly pluginEngine: PluginEngine,
    public readonly marketplaceEngine: MarketplaceEngine,
    public readonly capabilityDiscoveryEngine: CapabilityDiscoveryEngine,
    public readonly oauthEngine: OAuthEngine,
    public readonly webhookEngine: WebhookEngine,
    public readonly schedulerEngine: SchedulerEngine,
    public readonly synchronizationEngine: SynchronizationEngine,
    public readonly credentialEngine: CredentialEngine,
    public readonly sandboxEngine: SandboxEngine,
    public readonly monitoringEngine: MonitoringEngine,
    public readonly policyEngine: PolicyEngine,
  ) {}

  async initialize() {
    this.logger.log('Initializing Enterprise Integration Platform...');
    
    // Initialize engines in order of dependencies
    await this.credentialEngine.initialize();
    await this.policyEngine.initialize();
    await this.sandboxEngine.initialize();
    await this.capabilityDiscoveryEngine.initialize();
    await this.connectorEngine.initialize();
    await this.pluginEngine.initialize();
    await this.marketplaceEngine.initialize();
    await this.oauthEngine.initialize();
    await this.webhookEngine.initialize();
    await this.schedulerEngine.initialize();
    await this.synchronizationEngine.initialize();
    await this.monitoringEngine.initialize();

    this.logger.log('Enterprise Integration Platform Initialized.');
  }

  async healthCheck() {
    return {
      status: 'HEALTHY',
      timestamp: new Date().toISOString(),
      engines: {
        connector: await this.connectorEngine.healthCheck(),
        plugin: await this.pluginEngine.healthCheck(),
        oauth: await this.oauthEngine.healthCheck(),
        webhook: await this.webhookEngine.healthCheck(),
        scheduler: await this.schedulerEngine.healthCheck(),
      }
    };
  }
}
