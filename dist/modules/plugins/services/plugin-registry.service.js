"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginRegistryService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class PluginRegistryService {
    /**
     * Determines if a plugin is installed, enabled, and healthy for a given organization.
     */
    async getActivePlugins(organizationId) {
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
    async checkPluginHealth(installationId) {
        // In a real scenario, this pings the plugin's health endpoint
        // We mock a successful health check
        await prisma.pluginInstallation.update({
            where: { id: installationId },
            data: { healthStatus: 'HEALTHY' }
        });
    }
    async markDegraded(installationId) {
        await prisma.pluginInstallation.update({
            where: { id: installationId },
            data: { healthStatus: 'DEGRADED' }
        });
    }
}
exports.PluginRegistryService = PluginRegistryService;
