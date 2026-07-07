import { QdrantClient } from '@qdrant/js-client-rest';
import { AppError } from '../../../shared/errors/AppError';

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

export class VectorService {
  private client: QdrantClient;
  private readonly vectorSize = 384; // all-MiniLM-L6-v2 uses 384 dimensions

  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      apiKey: process.env.QDRANT_API_KEY,
    });
  }

  async ensureCollection(collectionName: string = 'knowledge_chunks'): Promise<void> {
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
      console.error('[VectorService] Failed to ensure collection', error);
      throw new AppError('Vector database connection failed', 500);
    }
  }

  async storeChunks(
    points: { id: string; vector: number[]; payload: any }[],
    collectionName: string = 'knowledge_chunks'
  ): Promise<void> {
    if (!points.length) return;

    try {
      await this.client.upsert(collectionName, {
        wait: true,
        points: points,
      });
    } catch (error: any) {
      console.error('[VectorService] Failed to store chunks', error);
      throw new AppError('Failed to store document chunks in vector database', 500);
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
    try {
      const limit = options?.limit || 5;
      const collectionName = options?.collectionName || 'knowledge_chunks';
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
      return results;
    } catch (error: any) {
      console.error('[VectorService] Similarity search failed', error);
      throw new AppError('Vector search failed', 500);
    }
  }

  async deleteVectors(
    ids: string[],
    collectionName: string = 'knowledge_chunks'
  ): Promise<void> {
    if (!ids.length) return;
    try {
      await this.client.delete(collectionName, {
        wait: true,
        points: ids
      });
    } catch (error: any) {
      console.error('[VectorService] Failed to delete vectors', error);
      throw new AppError('Failed to delete vectors from vector database', 500);
    }
  }
}
