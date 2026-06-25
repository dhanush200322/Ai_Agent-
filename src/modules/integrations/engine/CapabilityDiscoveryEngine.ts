import { Injectable, Logger } from '@nestjs/common';
import { ConnectorManifest, ProviderCapability } from '../interfaces/provider.interface';

@Injectable()
export class CapabilityDiscoveryEngine {
  private readonly logger = new Logger(CapabilityDiscoveryEngine.name);
  private capabilities: Map<string, ProviderCapability[]> = new Map();
  private manifests: Map<string, ConnectorManifest> = new Map();

  async initialize() {
    this.logger.log('Initializing CapabilityDiscoveryEngine...');
  }

  registerProviderCapabilities(providerSlug: string, manifest: ConnectorManifest, caps: ProviderCapability[]) {
    this.manifests.set(providerSlug, manifest);
    this.capabilities.set(providerSlug, caps);
    this.logger.debug(`Registered capabilities for provider: ${providerSlug}`);
  }

  getCapabilities(providerSlug: string): ProviderCapability[] {
    return this.capabilities.get(providerSlug) || [];
  }

  getAllCapabilities(): Record<string, ProviderCapability[]> {
    const result: Record<string, ProviderCapability[]> = {};
    for (const [providerSlug, caps] of this.capabilities.entries()) {
      result[providerSlug] = caps;
    }
    return result;
  }

  getProviderManifest(providerSlug: string): ConnectorManifest | undefined {
    return this.manifests.get(providerSlug);
  }

  hasCapability(providerSlug: string, action: string): boolean {
    const caps = this.capabilities.get(providerSlug);
    if (!caps) return false;
    return caps.some(c => c.action === action);
  }
}
