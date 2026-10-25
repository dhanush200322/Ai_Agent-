import { QdrantClient } from '@qdrant/js-client-rest';
import { AppError } from '../../../shared/errors/AppError';
import { prisma } from '../../../shared/prisma';

export interface VectorPayload {
  id: string; // chunk uuid
  organizationId: string;
  knowledgeBaseId: string;
  documentId: string;
  chunkId: string;
  chunkIndex: number;
  content: string;
  fileName: string;
  mimeType: string;
  page: number;
  createdAt: number;
  [key: string]: unknown;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export class VectorService {
  private client: QdrantClient;
  private readonly vectorSize = 384; // all-MiniLM-L6-v2 uses 384 dimensions
  private isQdrantHealthy: boolean | null = null;
  private lastHealthCheck: number = 0;

  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      apiKey: process.env.QDRANT_API_KEY,
      checkCompatibility: false,
    });
  }

  private async checkQdrantAvailability(): Promise<boolean> {
    const now = Date.now();
    // Cache check for 30s
    if (this.isQdrantHealthy !== null && (now - this.lastHealthCheck < 30000)) {
      return this.isQdrantHealthy;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';
      const checkUrl = `${qdrantUrl.replace(/\/$/, '')}/collections`;
      const headers: Record<string, string> = {};
      if (process.env.QDRANT_API_KEY) {
        headers['api-key'] = process.env.QDRANT_API_KEY;
      }

      const res = await fetch(checkUrl, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      this.isQdrantHealthy = res.ok;
      this.lastHealthCheck = now;
      return this.isQdrantHealthy;
    } catch {
      this.isQdrantHealthy = false;
      this.lastHealthCheck = now;
      return false;
    }
  }

  async ensureCollection(collectionName: string = 'knowledge_chunks'): Promise<void> {
    const available = await this.checkQdrantAvailability();
    if (!available) {
      console.warn(`[VectorService] Qdrant unavailable. Operating in PostgreSQL vector fallback mode.`);
      return;
    }

    try {
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(c => c.name === collectionName);
      
      if (!exists) {
        await this.client.createCollection(collectionName, {
          vectors: {
            size: this.vectorSize,
            distance: 'Cosine',
          },
        });
        
        // Create indexes for filtering
        await this.client.createPayloadIndex(collectionName, {
          field_name: 'organizationId',
          field_schema: 'keyword',
          wait: true,
        });
        
        // Only create knowledgeBaseId index for knowledge_chunks
        if (collectionName === 'knowledge_chunks') {
          await this.client.createPayloadIndex(collectionName, {
            field_name: 'knowledgeBaseId',
            field_schema: 'keyword',
            wait: true,
          });
        } else if (collectionName === 'conversation_memory') {
          await this.client.createPayloadIndex(collectionName, {
            field_name: 'agentId',
            field_schema: 'keyword',
            wait: true,
          });
          await this.client.createPayloadIndex(collectionName, {
            field_name: 'conversationId',
            field_schema: 'keyword',
            wait: true,
          });
        }

        console.log(`[VectorService] Created collection ${collectionName} with indexes`);
      }
    } catch (error: any) {
      console.warn(`[VectorService] Qdrant ensure collection failed (${error.message}). Falling back to PostgreSQL.`);
      this.isQdrantHealthy = false;
    }
  }

  async storeChunks(
    points: { id: string; vector: number[]; payload: any }[],
    collectionName: string = 'knowledge_chunks'
  ): Promise<void> {
    if (!points.length) return;

    // 1. If Qdrant is available, try saving there
    const available = await this.checkQdrantAvailability();
    if (available) {
      try {
        await this.client.upsert(collectionName, {
          wait: true,
          points: points,
        });
      } catch (error: any) {
        console.warn(`[VectorService] Qdrant upsert failed (${error.message}). Saving to PostgreSQL vector storage.`);
        this.isQdrantHealthy = false;
      }
    }

    // 2. Always persist vector and payload into PostgreSQL for fallback and high availability
    try {
      if (collectionName === 'knowledge_chunks') {
        for (const p of points) {
          // @ts-ignore
          await prisma.knowledgeChunk.updateMany({
            where: {
              OR: [
                { vectorId: p.id },
                { id: p.id }
              ]
            },
            data: {
              metadata: JSON.stringify({ vector: p.vector, payload: p.payload }),
              dimension: p.vector.length,
              embeddingModel: 'Xenova/all-MiniLM-L6-v2',
              status: 'READY',
            }
          });
        }
      } else if (collectionName === 'conversation_memory') {
        for (const p of points) {
          // @ts-ignore
          await prisma.conversationMemory.updateMany({
            where: { vectorId: p.id },
            data: {
              summary: JSON.stringify({ vector: p.vector, payload: p.payload }),
            }
          });
        }
      }
    } catch (dbErr: any) {
      console.error('[VectorService] Failed to persist vector data in PostgreSQL', dbErr);
      if (!available) {
        throw new AppError('Failed to store document chunks in vector storage', 500);
      }
    }
  }

  async similaritySearch(
    organizationId: string,
    queryVector: number[],
    options?: {
      knowledgeBaseIds?: string[];
      limit?: number;
      collectionName?: string;
      customFilters?: any[];
    }
  ) {
    const limit = options?.limit || 5;
    const collectionName = options?.collectionName || 'knowledge_chunks';

    // 1. Try Qdrant if available
    const available = await this.checkQdrantAvailability();
    if (available) {
      try {
        const mustFilters: any[] = [
          { key: 'organizationId', match: { value: organizationId } }
        ];

        if (options?.knowledgeBaseIds && options.knowledgeBaseIds.length > 0) {
          mustFilters.push({ 
            key: 'knowledgeBaseId', 
            match: { any: options.knowledgeBaseIds } 
          });
        }
        
        if (options?.customFilters) {
          mustFilters.push(...options.customFilters);
        }

        const results = await this.client.search(collectionName, {
          vector: queryVector,
          limit,
          filter: { must: mustFilters },
          with_payload: true
        });

        if (results && results.length > 0) {
          return results;
        }
      } catch (error: any) {
        console.warn(`[VectorService] Qdrant search failed (${error.message}). Falling back to PostgreSQL.`);
        this.isQdrantHealthy = false;
      }
    }

    // 2. Fall back to PostgreSQL vector search
    try {
      if (collectionName === 'conversation_memory') {
        let conversationIdFilter: string | undefined;
        if (options?.customFilters) {
          const convFilter = options.customFilters.find((f: any) => f.key === 'conversationId');
          if (convFilter?.match?.value) {
            conversationIdFilter = convFilter.match.value;
          }
        }

        // @ts-ignore
        const memories = await prisma.conversationMemory.findMany({
          where: {
            organizationId,
            ...(conversationIdFilter ? { conversationId: conversationIdFilter } : {}),
          }
        });

        const scored = [];
        for (const mem of memories) {
          let vec: number[] | null = null;
          let payload: any = null;
          if (mem.summary) {
            try {
              const parsed = JSON.parse(mem.summary);
              vec = parsed.vector;
              payload = parsed.payload;
            } catch {}
          }

          if (vec && Array.isArray(vec)) {
            const score = cosineSimilarity(queryVector, vec);
            scored.push({
              id: mem.vectorId,
              score,
              payload: payload || {
                id: mem.vectorId,
                conversationId: mem.conversationId,
                organizationId: mem.organizationId,
                agentId: mem.agentId,
                messageId: mem.messageId,
                memoryType: mem.memoryType,
                importance: mem.importance,
                createdAt: mem.createdAt.getTime(),
                content: mem.content,
              }
            });
          }
        }

        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, limit);
      }

      // Default: knowledge_chunks
      const where: any = {
        organizationId,
        metadata: { not: null },
      };

      if (options?.knowledgeBaseIds && options.knowledgeBaseIds.length > 0) {
        where.document = {
          knowledgeBaseId: { in: options.knowledgeBaseIds }
        };
      }

      // @ts-ignore
      const chunks = await prisma.knowledgeChunk.findMany({
        where,
        include: {
          document: {
            select: {
              id: true,
              knowledgeBaseId: true,
              originalName: true,
              mimeType: true,
            }
          }
        }
      });

      const scored = [];
      for (const chunk of chunks) {
        let vec: number[] | null = null;
        let payload: any = null;
        if (chunk.metadata) {
          try {
            const parsed = JSON.parse(chunk.metadata);
            vec = parsed.vector;
            payload = parsed.payload;
          } catch {}
        }

        if (vec && Array.isArray(vec)) {
          const score = cosineSimilarity(queryVector, vec);
          scored.push({
            id: chunk.vectorId || chunk.id,
            score,
            payload: payload || {
              id: chunk.vectorId || chunk.id,
              organizationId: chunk.organizationId,
              knowledgeBaseId: chunk.document?.knowledgeBaseId,
              documentId: chunk.documentId,
              chunkId: chunk.vectorId || chunk.id,
              chunkIndex: 0,
              content: chunk.text,
              fileName: chunk.document?.originalName || '',
              mimeType: chunk.document?.mimeType || 'text/plain',
              page: chunk.pageNumber || 1,
              createdAt: chunk.createdAt.getTime(),
            }
          });
        }
      }

      scored.sort((a, b) => b.score - a.score);
      return scored.slice(0, limit);
    } catch (dbErr: any) {
      console.error('[VectorService] PostgreSQL vector search failed', dbErr);
      return [];
    }
  }

  async deleteVectors(
    ids: string[],
    collectionName: string = 'knowledge_chunks'
  ): Promise<void> {
    if (!ids.length) return;

    const available = await this.checkQdrantAvailability();
    if (available) {
      try {
        await this.client.delete(collectionName, {
          wait: true,
          points: ids
        });
      } catch (error: any) {
        console.warn('[VectorService] Failed to delete vectors in Qdrant', error);
      }
    }

    try {
      if (collectionName === 'knowledge_chunks') {
        // @ts-ignore
        await prisma.knowledgeChunk.deleteMany({
          where: {
            OR: [
              { vectorId: { in: ids } },
              { id: { in: ids } }
            ]
          }
        });
      }
    } catch (dbErr: any) {
      console.error('[VectorService] Failed to delete chunks from PostgreSQL', dbErr);
    }
  }
}
