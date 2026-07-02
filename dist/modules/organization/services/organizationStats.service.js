"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationStatsService = void 0;
const prisma_1 = require("../../../shared/prisma");
class OrganizationStatsService {
    async getOrganizationStats(organizationId) {
        const [totalUsers, activeUsers, totalAgents, activeAgents, totalConversations, totalKnowledgeBases, workflowsRun, knowledgeDocs] = await Promise.all([
            prisma_1.prisma.user.count({ where: { organizationId, deletedAt: null } }),
            prisma_1.prisma.user.count({ where: { organizationId, deletedAt: null, status: 'ACTIVE' } }),
            prisma_1.prisma.agent.count({ where: { organizationId, deletedAt: null } }),
            prisma_1.prisma.agent.count({ where: { organizationId, deletedAt: null, status: 'ACTIVE' } }),
            prisma_1.prisma.conversation.count({ where: { organizationId, deletedAt: null } }),
            prisma_1.prisma.knowledgeBase.count({ where: { organizationId, deletedAt: null } }),
            prisma_1.prisma.workflowExecution.count({ where: { organizationId } }),
            prisma_1.prisma.knowledgeDocument.findMany({ where: { organizationId, deletedAt: null }, select: { size: true } })
        ]);
        const storageUsageBytes = knowledgeDocs.reduce((acc, doc) => acc + (doc.size || 0), 0);
        const apiUsageCost = 0; // Cost calculation placeholder, assuming free tier/starting at 0 for now.
        return {
            totalUsers,
            activeUsers,
            totalAgents,
            activeAgents,
            totalConversations,
            totalKnowledgeBases,
            workflowsRun,
            storageUsageBytes,
            apiUsageCost,
        };
    }
}
exports.OrganizationStatsService = OrganizationStatsService;
