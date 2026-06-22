import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class KnowledgeRepository {
  
  async findKnowledgeBases(organizationId: string, skip: number, limit: number, search?: string) {
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
      prisma.knowledgeBase.findMany({
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
      prisma.knowledgeBase.count({ where })
    ]);

    return { items, total };
  }

  async findKnowledgeBaseById(organizationId: string, id: string) {
    return prisma.knowledgeBase.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, avatar: true }
        }
      }
    });
  }

  async createKnowledgeBase(data: any) {
    return prisma.knowledgeBase.create({
      data
    });
  }

  async updateKnowledgeBase(_organizationId: string, id: string, data: any) {
    return prisma.knowledgeBase.update({
      where: { id },
      data
    });
  }

  async softDeleteKnowledgeBase(_organizationId: string, id: string) {
    return prisma.knowledgeBase.update({
      where: { id },
      data: { 
        deletedAt: new Date()
      }
    });
  }

  // Document methods

  async createKnowledgeDocument(data: any) {
    return prisma.knowledgeDocument.create({
      data
    });
  }

  async findKnowledgeDocuments(organizationId: string, knowledgeBaseId: string) {
    return prisma.knowledgeDocument.findMany({
      where: {
        organizationId,
        knowledgeBaseId,
        deletedAt: null
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findKnowledgeDocumentById(organizationId: string, id: string) {
    return prisma.knowledgeDocument.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null
      }
    });
  }

  async softDeleteKnowledgeDocument(_organizationId: string, id: string) {
    return prisma.knowledgeDocument.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'DELETED'
      }
    });
  }
}
