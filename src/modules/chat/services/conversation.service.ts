import { PrismaClient } from '@prisma/client';
type ConversationStatus = 'ACTIVE' | 'ARCHIVED' | 'DELETED';
import { AppError } from '../../../shared/errors/AppError';

const prisma = new PrismaClient();

export class ConversationService {
  /**
   * Create a new conversation
   */
  async createConversation(data: {
    sessionId?: string;
    organizationId: string;
    agentId: string;
    userId: string;
  }) {
    return (prisma as any).conversation.create({
      data: {
        sessionId: data.sessionId,
        organizationId: data.organizationId,
        agentId: data.agentId,
        userId: data.userId,
        status: 'ACTIVE'
      }
    });
  }

  /**
   * Get conversation by ID
   */
  async getConversationById(id: string, organizationId: string) {
    try {
      const conversation = await (prisma as any).conversation.findFirst({
        where: {
          id,
          organizationId,
          deletedAt: null
        },
        include: {
          agent: {
            select: { id: true, name: true, slug: true }
          }
        }
      });

      if (!conversation) {
        throw new AppError('Conversation not found', 404);
      }

      return conversation;
    } catch (error: any) {
      throw new AppError('Conversation not found', 404);
    }
  }

  /**
   * List conversations with pagination
   */
  async listConversations(params: {
    organizationId: string;
    userId?: string;
    agentId?: string;
    status?: ConversationStatus;
    skip: number;
    limit: number;
  }) {
    const where: any = {
      organizationId: params.organizationId,
      deletedAt: null
    };

    if (params.userId) where.userId = params.userId;
    if (params.agentId) where.agentId = params.agentId;
    if (params.status) where.status = params.status;

    const [items, total] = await Promise.all([
      (prisma as any).conversation.findMany({
        where,
        skip: params.skip,
        take: params.limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          agent: { select: { id: true, name: true } }
        }
      }),
      (prisma as any).conversation.count({ where })
    ]);

    return { items, total };
  }

  /**
   * Archive conversation
   */
  async archiveConversation(id: string, organizationId: string) {
    const conversation = await this.getConversationById(id, organizationId);
    
    return (prisma as any).conversation.update({
      where: { id: conversation.id },
      data: { status: 'ARCHIVED' }
    });
  }

  /**
   * Restore conversation
   */
  async restoreConversation(id: string, organizationId: string) {
    const conversation = await this.getConversationById(id, organizationId);
    
    return (prisma as any).conversation.update({
      where: { id: conversation.id },
      data: { status: 'ACTIVE' }
    });
  }

  /**
   * Soft Delete conversation
   */
  async deleteConversation(id: string, organizationId: string) {
    const conversation = await this.getConversationById(id, organizationId);
    
    return (prisma as any).conversation.update({
      where: { id: conversation.id },
      data: { 
        status: 'DELETED',
        deletedAt: new Date()
      }
    });
  }

  /**
   * Update Conversation Title
   */
  async updateTitle(id: string, title: string) {
    return (prisma as any).conversation.update({
      where: { id },
      data: { title }
    });
  }

  /**
   * Update Conversation Summary
   */
  async updateSummary(id: string, summary: string) {
    return prisma.conversation.update({
      where: { id },
      data: { summary }
    });
  }

  /**
   * Update lastMessageAt
   */
  async updateLastMessageAt(id: string) {
    return prisma.conversation.update({
      where: { id },
      data: { lastMessageAt: new Date() }
    });
  }
}
