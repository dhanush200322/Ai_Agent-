import { PrismaClient, MessageRole } from '@prisma/client';

const prisma = new PrismaClient();

export class ConversationMessageService {
  /**
   * Save a single message to a conversation
   */
  async saveMessage(data: {
    conversationId: string;
    role: MessageRole;
    content: string;
    model?: string;
    temperature?: number;
    latency?: number;
    finishReason?: string;
    streaming?: boolean;
    tokens?: number;
    promptTokens?: number;
    completionTokens?: number;
  }) {
    return prisma.conversationMessage.create({
      data: {
        conversationId: data.conversationId,
        role: data.role,
        content: data.content,
        model: data.model,
        temperature: data.temperature,
        latency: data.latency,
        finishReason: data.finishReason,
        streaming: data.streaming || false,
        tokens: data.tokens,
        promptTokens: data.promptTokens,
        completionTokens: data.completionTokens
      }
    });
  }

  /**
   * Get the history of a conversation
   */
  async getHistory(conversationId: string, limit: number = 50, skip: number = 0) {
    return prisma.conversationMessage.findMany({
      where: {
        conversationId
      },
      orderBy: {
        createdAt: 'asc'
      },
      skip,
      take: limit
    });
  }

  /**
   * Count total messages in a conversation
   */
  async countMessages(conversationId: string) {
    return prisma.conversationMessage.count({
      where: {
        conversationId
      }
    });
  }

  /**
   * Get total token usage for a conversation
   */
  async getTokenUsage(conversationId: string) {
    const agg = await prisma.conversationMessage.aggregate({
      where: { conversationId },
      _sum: {
        tokens: true,
        promptTokens: true,
        completionTokens: true
      }
    });
    
    return {
      totalTokens: agg._sum.tokens || 0,
      promptTokens: agg._sum.promptTokens || 0,
      completionTokens: agg._sum.completionTokens || 0
    };
  }
}
