import { VectorService } from '../../knowledge/services/vector.service';
import { EmbeddingService } from '../../knowledge/services/embedding.service';
import { RetrievalResult } from '../types/chat.types';

export class RetrievalService {
  private vectorService = new VectorService();
  private embeddingService = new EmbeddingService();

  /**
   * Retrieves relevant context chunks from Qdrant, filters out low scores,
   * removes duplicate chunks, and ranks them by similarity score.
   */
  async retrieveContext(
    organizationId: string,
    query: string,
    options?: {
      knowledgeBaseIds?: string[];
      topK?: number;
      minScore?: number;
    }
  ): Promise<RetrievalResult[]> {
    const topK = options?.topK || 5;
    const minScore = options?.minScore || 0.05;

    // 1. Generate Query Embedding
    const queryVectors = await this.embeddingService.generateEmbeddings([query]);
    const queryVector = queryVectors[0];

    // 2. Vector Search
    // Request more to account for duplicates being filtered out
    const fetchLimit = topK * 2; 
    const qdrantResults = await this.vectorService.similaritySearch(
      organizationId,
      queryVector,
      {
        knowledgeBaseIds: options?.knowledgeBaseIds,
        limit: fetchLimit
      }
    );

    console.log('[RetrievalService] Qdrant Results:', qdrantResults.map(r => ({ score: r.score, text: (r.payload as any)?.content?.substring(0, 50) })));

    // 3. Score Filtering
    const filteredResults = qdrantResults.filter(res => res.score >= minScore);

    // 4. Duplicate Removal (Deduplicate by chunkId)
    const uniqueChunks: RetrievalResult[] = [];
    const seenChunkIds = new Set<string>();

    for (const res of filteredResults) {
      const payload = res.payload as any;
      if (!payload || !payload.chunkId) continue;

      if (!seenChunkIds.has(payload.chunkId)) {
        seenChunkIds.add(payload.chunkId);
        
        uniqueChunks.push({
          id: payload.chunkId,
          score: res.score,
          content: payload.content || '',
          documentId: payload.documentId || '',
          knowledgeBaseId: payload.knowledgeBaseId || '',
          fileName: payload.fileName || '',
          page: payload.page || 1,
          chunkIndex: payload.chunkIndex || 0,
        });
      }
    }

    // 5. Ranking (already sorted by Qdrant descending, just slice topK)
    return uniqueChunks.slice(0, topK);
  }
}
