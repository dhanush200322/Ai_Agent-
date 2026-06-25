"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationStatsService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class OrganizationStatsService {
    async getOrganizationStats(organizationId) {
        const [totalUsers, totalAgents] = await Promise.all([
            prisma.user.count({ where: { organizationId, deletedAt: null } }),
            prisma.agent.count({ where: { organizationId, deletedAt: null } })
        ]);
        return {
            totalUsers,
            totalAgents,
            totalConversations: 0, // Placeholder
            totalKnowledgeBases: 0, // Placeholder
            storageUsageBytes: 0, // Placeholder
        };
    }
}
exports.OrganizationStatsService = OrganizationStatsService;
