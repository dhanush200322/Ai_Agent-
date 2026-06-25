"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginLoaderService = void 0;
const client_1 = require("@prisma/client");
const manifest_validator_1 = require("../validators/manifest.validator");
const plugin_dependency_service_1 = require("./plugin-dependency.service");
const prisma = new client_1.PrismaClient();
const dependencyService = new plugin_dependency_service_1.PluginDependencyService();
class PluginLoaderService {
    /**
     * The complete plugin lifecycle: Upload -> Validate -> Verify -> Install -> Enable
     */
    async processPluginLifecycle(organizationId, userId, manifestRaw, signature) {
        console.log('[Loader] Phase 1: Uploading...');
        let manifest;
        console.log('[Loader] Phase 2: Validating...');
        try {
            manifest = manifest_validator_1.ManifestValidator.validate(manifestRaw);
            manifest_validator_1.ManifestValidator.verifyPlatformCompatibility(manifest, "6.9.0");
        }
        catch (e) {
            throw new Error(`Validation Error: ${e.message}`);
        }
        console.log('[Loader] Phase 3: Verifying Signature...');
        manifest_validator_1.ManifestValidator.verifySignature(manifest, signature);
        console.log('[Loader] Phase 4: Dependency Resolution...');
        await dependencyService.resolveDependencies(manifest, organizationId);
        console.log('[Loader] Phase 5: Installing...');
        // Create Plugin if it doesn't exist
        let plugin = await prisma.plugin.findUnique({ where: { slug: manifest.id } });
        if (!plugin) {
            plugin = await prisma.plugin.create({
                data: {
                    name: manifest.name,
                    slug: manifest.id,
                    description: manifest.description,
                    author: manifest.author,
                    organizationId: organizationId // Private by default in this flow
                }
            });
        }
        let version = await prisma.pluginVersion.findFirst({
            where: { pluginId: plugin.id, version: manifest.version }
        });
        if (!version) {
            version = await prisma.pluginVersion.create({
                data: {
                    pluginId: plugin.id,
                    version: manifest.version,
                    manifest: JSON.stringify(manifest),
                    checksum: manifest.checksum,
                    signature: manifest.signature
                }
            });
        }
        const installation = await prisma.pluginInstallation.create({
            data: {
                pluginId: plugin.id,
                organizationId,
                installedById: userId,
                installedVersion: manifest.version,
                lifecycleState: 'INSTALLED'
            }
        });
        console.log('[Loader] Phase 6: Enabling...');
        await prisma.pluginInstallation.update({
            where: { id: installation.id },
            data: { lifecycleState: 'ENABLED' }
        });
        return installation;
    }
}
exports.PluginLoaderService = PluginLoaderService;
