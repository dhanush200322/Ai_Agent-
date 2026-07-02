"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginRegistryService = void 0;
const prisma_1 = require("../../../shared/prisma");
class PluginRegistryService {
    /**
     * Determines if a plugin is installed, enabled, and healthy for a given organization.
     */
    async getActivePlugins(organizationId) {
        return prisma_1.prisma.pluginInstallation.findMany({
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
    async checkPluginHealth(installationId) {
        // In a real scenario, this pings the plugin's health endpoint
        // We mock a successful health check
        await prisma_1.prisma.pluginInstallation.update({
            where: { id: installationId },
            data: { healthStatus: 'HEALTHY' }
        });
    }
    async markDegraded(installationId) {
        await prisma_1.prisma.pluginInstallation.update({
            where: { id: installationId },
            data: { healthStatus: 'DEGRADED' }
        });
    }
}
exports.PluginRegistryService = PluginRegistryService;
