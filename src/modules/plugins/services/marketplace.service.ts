import { prisma } from '../../../shared/prisma';
import { PrismaClient } from '@prisma/client';



export class MarketplaceService {
  /**
   * Retrieve catalog combining Public global plugins + Private Org plugins
   */
  async getCatalog(organizationId: string) {
    return prisma.plugin.findMany({
      where: {
        OR: [
          { visibility: 'PUBLIC', status: 'PUBLISHED' },
          { organizationId: organizationId, status: 'PUBLISHED' }
        ]
      },
      include: {
        versions: {
          orderBy: { publishedAt: 'desc' },
          take: 1
        }
      }
    });
  }

  async publishPrivatePlugin(organizationId: string, slug: string) {
    return prisma.plugin.update({
      where: { slug },
      data: { status: 'PUBLISHED', visibility: 'PRIVATE', organizationId }
    });
  }
}
