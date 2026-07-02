import { prisma } from '../../../shared/prisma';
import { PrismaClient } from '@prisma/client';
import { PluginManifest } from '../sdk/plugin-manifest';



export class PluginDependencyService {
  
  async resolveDependencies(manifest: PluginManifest, organizationId: string): Promise<boolean> {
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
