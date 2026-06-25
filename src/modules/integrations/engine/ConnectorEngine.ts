import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IntegrationProvider } from '../interfaces/provider.interface';

@Injectable()
export class ConnectorEngine {
  private readonly logger = new Logger(ConnectorEngine.name);
  private providers: Map<string, IntegrationProvider> = new Map();

  constructor(private readonly prisma: PrismaClient) {}

  async initialize() {
    this.logger.log('Initializing ConnectorEngine...');
  }

  registerProvider(slug: string, provider: IntegrationProvider) {
    this.providers.set(slug, provider);
    this.logger.debug(`Registered provider implementation: ${slug}`);
  }

  getProvider(slug: string): IntegrationProvider {
    const provider = this.providers.get(slug);
    if (!provider) {
      throw new NotFoundException(`Provider ${slug} not found`);
    }
    return provider;
  }

  async executeAction(organizationId: string, connectorId: string, action: string, payload: any): Promise<any> {
    const connector = await this.prisma.connector.findUnique({
      where: { id: connectorId },
    });
    
    if (!connector) throw new NotFoundException('Connector not found');
    if (connector.organizationId !== organizationId) throw new NotFoundException('Unauthorized connector access');

    // Resolve provider from connector... in real implementation would fetch provider string
    // Here we assume name is the provider slug for demo purposes
    const providerSlug = connector.name.toLowerCase(); 
    const provider = this.getProvider(providerSlug);
    
    this.logger.debug(`Executing action ${action} on connector ${connectorId}`);
    return await provider.executeAction(action, payload);
  }

  async healthCheck() {
    return { status: 'HEALTHY', registeredProviders: this.providers.size };
  }
}
