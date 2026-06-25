"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class MarketplaceService {
    /**
     * Retrieve catalog combining Public global plugins + Private Org plugins
     */
    async getCatalog(organizationId) {
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
    async publishPrivatePlugin(organizationId, slug) {
        return prisma.plugin.update({
            where: { slug },
            data: { status: 'PUBLISHED', visibility: 'PRIVATE', organizationId }
        });
    }
}
exports.MarketplaceService = MarketplaceService;
