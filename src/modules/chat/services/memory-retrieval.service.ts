import { PrismaClient } from '@prisma/client';
import { EmbeddingService } from '../../knowledge/services/embedding.service';
import { VectorService } from '../../knowledge/services/vector.service';

const prisma = new PrismaClient();
const embeddingService = new EmbeddingService();
const vectorService = new VectorService();

export class MemoryRetrievalService {
  /**
   * Retrieve, rank, and deduplicate memories
   */
  async retrieveMemories(
    organizationId: string,
    conversationId: string,
    query: string,
    limit: number = 10
  ) {
    // 1. Generate query embedding
    const queryVectors = await embeddingService.generateEmbeddings([query]);
    const queryVector = queryVectors[0];

    // 2. Search Qdrant memory collection
    // We filter by conversationId to isolate session memory
    // In a multi-agent environment, we could expand to agentId memory
    const customFilters = [
      { key: 'conversationId', match: { value: conversationId } }
    ];

    const searchResults = await vectorService.similaritySearch(
      organizationId,
      queryVector,
      {
        collectionName: 'conversation_memory',
        limit: 50, // Fetch more to allow ranking and deduplication
        customFilters
      }
    );

    if (!searchResults || searchResults.length === 0) {
      return [];
    }

    const now = Date.now();

    // 3. Rank memories
    // Score = 0.60 Similarity + 0.25 Recency + 0.15 Importance
    const rankedMemories = searchResults.map((result: any) => {
      const payload = result.payload;
      
      const similarity = result.score;
      const importance = (payload.importance || 0) / 100; // normalized to 0-1
      
      // Recency: 1.0 for now, decays over 30 days
      const ageMs = now - (payload.createdAt || now);
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      const recencyRaw = Math.max(0, 1 - (ageMs / thirtyDays));
      const recency = recencyRaw;

      const compositeScore = (0.60 * similarity) + (0.25 * recency) + (0.15 * importance);

      return {
        id: result.id,
        content: payload.content,
        similarity,
        recency,
        importance,
        compositeScore,
        createdAt: payload.createdAt,
        memoryType: payload.memoryType
      };
    });

    // Sort by composite score
    rankedMemories.sort((a, b) => b.compositeScore - a.compositeScore);

    // 4. Remove exact duplicates (simple deduplication by content)
    const uniqueMemories = [];
    const seenContent = new Set<string>();

    for (const mem of rankedMemories) {
      // Very simple normalization
      const norm = mem.content.trim().toLowerCase();
      if (!seenContent.has(norm)) {
        seenContent.add(norm);
        uniqueMemories.push(mem);
        
        // Track retrieval in DB asynchronously
        prisma.conversationMemory.update({
          where: { vectorId: mem.id },
          data: { 
            retrievalCount: { increment: 1 },
            lastAccessed: new Date(),
            score: mem.compositeScore
          }
        }).catch(err => console.error('[MemoryRetrieval] Failed to update stats', err));
      }
      if (uniqueMemories.length >= limit) break;
    }

    return uniqueMemories;
  }
}
