import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class OrganizationStatsService {
  async getOrganizationStats(organizationId: string) {
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
