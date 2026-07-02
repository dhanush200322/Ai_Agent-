import { prisma } from '../../../shared/prisma';
import { PrismaClient, MemoryType } from '@prisma/client';
import { EmbeddingService } from '../../knowledge/services/embedding.service';
import { VectorService } from '../../knowledge/services/vector.service';
import { randomUUID } from 'crypto';


const embeddingService = new EmbeddingService();
const vectorService = new VectorService();

export class MemoryService {
  constructor() {
    // Ensure the conversation_memory collection exists in Qdrant
    vectorService.ensureCollection('conversation_memory').catch(err => {
      console.error('[MemoryService] Failed to ensure collection', err);
    });
  }

  /**
   * Calculate importance (0-100) based on content heuristics.
   * Simple initial implementation.
   */
  private calculateImportance(content: string, role: string): number {
    let score = 50; // Base score
    
    // User messages are slightly more important for context
    if (role === 'USER') score += 10;
    
    // Longer messages usually hold more substance, up to a point
    const length = content.length;
    if (length > 100) score += 10;
    if (length > 500) score += 10;
    
    // Explicit keywords
    const keywords = ['remember', 'important', 'crucial', 'always', 'never', 'secret', 'password', 'key'];
    const lowerContent = content.toLowerCase();
    for (const kw of keywords) {
      if (lowerContent.includes(kw)) score += 5;
    }

    return Math.min(score, 100);
  }

  /**
   * Save a new memory
   */
  async saveMemory(data: {
    conversationId: string;
    organizationId: string;
    agentId: string;
    messageId?: string;
    content: string;
    role: string;
    memoryType?: MemoryType;
  }) {
    // 1. Calculate Importance
    const importance = this.calculateImportance(data.content, data.role);

    // 2. Generate Embedding
    const embeddings = await embeddingService.generateEmbeddings([data.content]);
    const vector = embeddings[0];

    // 3. Save to Prisma
    const vectorId = randomUUID();
    const memory = await prisma.conversationMemory.create({
      data: {
        conversationId: data.conversationId,
        organizationId: data.organizationId,
        agentId: data.agentId,
        messageId: data.messageId,
        content: data.content,
        embeddingModel: 'Xenova/all-MiniLM-L6-v2', // Match embedding service model
        vectorId,
        memoryType: data.memoryType || 'SHORT_TERM',
        importance
      }
    });

    // 4. Save to Qdrant
    await vectorService.storeChunks([{
      id: vectorId,
      vector,
      payload: {
        id: vectorId,
        conversationId: data.conversationId,
        organizationId: data.organizationId,
        agentId: data.agentId,
        messageId: data.messageId || null,
        memoryType: data.memoryType || 'SHORT_TERM',
        importance,
        createdAt: memory.createdAt.getTime(),
        content: data.content
      }
    }], 'conversation_memory');

    return memory;
  }
}
