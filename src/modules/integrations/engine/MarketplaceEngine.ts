import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class MarketplaceEngine {
  private readonly logger = new Logger(MarketplaceEngine.name);

  constructor(private readonly prisma: PrismaClient) {}

  async initialize() {
    this.logger.log('Initializing MarketplaceEngine...');
  }

  async searchPlugins(query: string, category?: string) {
    // Basic search implementation for marketplace
    return this.prisma.pluginMarketplaceEntry.findMany({
      where: {
        plugin: {
          status: 'PUBLISHED',
          visibility: 'PUBLIC',
          name: { contains: query, mode: 'insensitive' }
        },
        ...(category && { categoryId: category })
      },
      include: { plugin: { include: { versions: { take: 1, orderBy: { publishedAt: 'desc' } } } } }
    });
  }

  async getPluginDetails(pluginId: string) {
    return this.prisma.plugin.findUnique({
      where: { id: pluginId },
      include: { versions: true }
    });
  }
}
