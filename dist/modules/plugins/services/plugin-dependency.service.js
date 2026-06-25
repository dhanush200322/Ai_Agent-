"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginDependencyService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class PluginDependencyService {
    async resolveDependencies(manifest, organizationId) {
        const deps = Object.keys(manifest.dependencies || {});
        for (const depSlug of deps) {
            const requiredVersion = manifest.dependencies[depSlug];
            // Check if installed
            const installed = await prisma.pluginInstallation.findFirst({
                where: {
                    organizationId,
                    plugin: { slug: depSlug },
                    lifecycleState: { in: ['ENABLED', 'CONFIGURED', 'INSTALLED'] }
                }
            });
            if (!installed) {
                throw new Error(`Dependency resolution failed: Plugin requires ${depSlug}@${requiredVersion} but it is not installed.`);
            }
            // Semantic version check logic goes here
            // e.g. semver.satisfies(installed.installedVersion, requiredVersion)
        }
        return true;
    }
}
exports.PluginDependencyService = PluginDependencyService;
