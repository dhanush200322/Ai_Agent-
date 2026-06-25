import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { SandboxEngine } from './SandboxEngine';

@Injectable()
export class PluginEngine {
  private readonly logger = new Logger(PluginEngine.name);

  constructor(
    private readonly prisma: PrismaClient,
    private readonly sandboxEngine: SandboxEngine
  ) {}

  async initialize() {
    this.logger.log('Initializing PluginEngine...');
  }

  async installPlugin(organizationId: string, pluginId: string, version: string, userId: string) {
    this.logger.log(`Installing plugin ${pluginId} version ${version} for org ${organizationId}`);
    return this.prisma.pluginInstallation.create({
      data: {
        pluginId,
        organizationId,
        installedById: userId,
        installedVersion: version,
        lifecycleState: 'INSTALLED',
      }
    });
  }

  async uninstallPlugin(organizationId: string, installationId: string) {
    this.logger.log(`Uninstalling plugin installation ${installationId} for org ${organizationId}`);
    await this.prisma.pluginInstallation.delete({
      where: { id: installationId, organizationId }
    });
  }

  async executePluginFunction(installationId: string, funcName: string, args: any) {
    this.logger.log(`Executing plugin function ${funcName} for installation ${installationId}`);
    // Use sandbox to execute
    return this.sandboxEngine.executeInSandbox(installationId, funcName, args);
  }

  async healthCheck() {
    return { status: 'HEALTHY' };
  }
}
