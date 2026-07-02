"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceService = void 0;
const prisma_1 = require("../../../shared/prisma");
class MarketplaceService {
    /**
     * Retrieve catalog combining Public global plugins + Private Org plugins
     */
    async getCatalog(organizationId) {
        return prisma_1.prisma.plugin.findMany({
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
    async publishPrivatePlugin(organizationId, slug) {
        return prisma_1.prisma.plugin.update({
            where: { slug },
            data: { status: 'PUBLISHED', visibility: 'PRIVATE', organizationId }
        });
    }
}
exports.MarketplaceService = MarketplaceService;
