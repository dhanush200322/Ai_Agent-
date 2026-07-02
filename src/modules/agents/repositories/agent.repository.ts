import { prisma } from '../../../shared/prisma';
import { PrismaClient } from '@prisma/client';



export class AgentRepository {
  
  async findAgents(organizationId: string, skip: number, limit: number, search?: string) {
    const where: any = { 
      organizationId,
      deletedAt: null
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.agent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: { id: true, firstName: true, lastName: true, avatar: true }
          }
        }
      }),
      prisma.agent.count({ where })
    ]);

    return { items, total };
  }

  async findAgentById(organizationId: string, id: string) {
    return prisma.agent.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, avatar: true }
        }
      }
    });
  }

  async findAgentBySlug(organizationId: string, slug: string) {
    return prisma.agent.findFirst({
      where: { slug, organizationId, deletedAt: null }
    });
  }

  async createAgent(data: any) {
    return prisma.agent.create({
      data
    });
  }

  async updateAgent(_organizationId: string, id: string, data: any) {
    return prisma.agent.update({
      where: { id },
      data
    });
  }

  async softDeleteAgent(_organizationId: string, id: string) {
    const agent = await prisma.agent.findUnique({ where: { id } });
    const deletedSlug = agent ? `${agent.slug}-deleted-${Date.now()}` : `deleted-${Date.now()}`;
    return prisma.agent.update({
      where: { id },
      data: { 
        deletedAt: new Date(),
        status: 'ARCHIVED',
        slug: deletedSlug
      }
    });
  }

  async getKnowledgeBases(organizationId: string, agentId: string) {
    return prisma.agentKnowledgeBase.findMany({
      where: {
        agentId,
        knowledgeBase: { organizationId, deletedAt: null }
      },
      include: {
        knowledgeBase: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async addKnowledgeBases(agentId: string, knowledgeBaseIds: string[]) {
    // Bulk insert ignore conflicts
    const data = knowledgeBaseIds.map(kbId => ({
      agentId,
      knowledgeBaseId: kbId
    }));
    return prisma.agentKnowledgeBase.createMany({
      data,
      skipDuplicates: true
    });
  }

  async removeKnowledgeBase(agentId: string, knowledgeBaseId: string) {
    return prisma.agentKnowledgeBase.delete({
      where: {
        agentId_knowledgeBaseId: {
          agentId,
          knowledgeBaseId
        }
      }
    });
  }
}

