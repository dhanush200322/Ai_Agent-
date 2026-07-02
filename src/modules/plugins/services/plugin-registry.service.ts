import { prisma } from '../../../shared/prisma';
import { PrismaClient } from '@prisma/client';



export class PluginRegistryService {
  /**
   * Determines if a plugin is installed, enabled, and healthy for a given organization.
   */
  async getActivePlugins(organizationId: string) {
    return prisma.pluginInstallation.findMany({
      where: {
        organizationId,
        lifecycleState: 'ENABLED',
        healthStatus: 'HEALTHY'
      },
      include: {
        plugin: true
      }
    });
  }

  async checkPluginHealth(installationId: string) {
    // In a real scenario, this pings the plugin's health endpoint
    // We mock a successful health check
    await prisma.pluginInstallation.update({
      where: { id: installationId },
      data: { healthStatus: 'HEALTHY' }
    });
  }

  async markDegraded(installationId: string) {
    await prisma.pluginInstallation.update({
      where: { id: installationId },
      data: { healthStatus: 'DEGRADED' }
    });
  }
}
