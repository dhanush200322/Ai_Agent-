import { prisma } from '../../../shared/prisma';
import { PrismaClient } from '@prisma/client';



export class OrganizationStatsService {
  async getOrganizationStats(organizationId: string) {
    const [
      totalUsers, 
      activeUsers,
      totalAgents, 
      activeAgents,
      totalConversations,
      totalKnowledgeBases,
      workflowsRun,
      knowledgeDocs
    ] = await Promise.all([
      prisma.user.count({ where: { organizationId, deletedAt: null } }),
      prisma.user.count({ where: { organizationId, deletedAt: null, status: 'ACTIVE' } }),
      prisma.agent.count({ where: { organizationId, deletedAt: null } }),
      prisma.agent.count({ where: { organizationId, deletedAt: null, status: 'ACTIVE' } }),
      prisma.conversation.count({ where: { organizationId, deletedAt: null } }),
      prisma.knowledgeBase.count({ where: { organizationId, deletedAt: null } }),
      prisma.workflowExecution.count({ where: { organizationId } }),
      prisma.knowledgeDocument.findMany({ where: { organizationId, deletedAt: null }, select: { size: true } })
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
