import { PrismaClient } from '@prisma/client';
import { PluginManifest } from '../sdk/plugin-manifest';
import { ManifestValidator } from '../validators/manifest.validator';
import { PluginDependencyService } from './plugin-dependency.service';

const prisma = new PrismaClient();
const dependencyService = new PluginDependencyService();

export class PluginLoaderService {
  /**
   * The complete plugin lifecycle: Upload -> Validate -> Verify -> Install -> Enable
   */
  async processPluginLifecycle(organizationId: string, userId: string, manifestRaw: any, signature: string) {
    
    console.log('[Loader] Phase 1: Uploading...');
    let manifest: PluginManifest;

    console.log('[Loader] Phase 2: Validating...');
    try {
      manifest = ManifestValidator.validate(manifestRaw);
      ManifestValidator.verifyPlatformCompatibility(manifest, "6.9.0");
    } catch (e: any) {
      throw new Error(`Validation Error: ${e.message}`);
    }

    console.log('[Loader] Phase 3: Verifying Signature...');
    ManifestValidator.verifySignature(manifest, signature);

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
          checksum: manifest.checksum!,
          signature: manifest.signature!
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
