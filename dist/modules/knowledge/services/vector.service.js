"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorService = void 0;
const js_client_rest_1 = require("@qdrant/js-client-rest");
const AppError_1 = require("../../../shared/errors/AppError");
class VectorService {
    client;
    vectorSize = 384; // all-MiniLM-L6-v2 uses 384 dimensions
    constructor() {
        this.client = new js_client_rest_1.QdrantClient({
            url: process.env.QDRANT_URL || 'http://localhost:6333',
            apiKey: process.env.QDRANT_API_KEY,
        });
    }
    async ensureCollection(collectionName = 'knowledge_chunks') {
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
                }
                else if (collectionName === 'conversation_memory') {
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
        }
        catch (error) {
            console.error('[VectorService] Failed to ensure collection', error);
            throw new AppError_1.AppError('Vector database connection failed', 500);
        }
    }
    async storeChunks(points, collectionName = 'knowledge_chunks') {
        if (!points.length)
            return;
        try {
            await this.client.upsert(collectionName, {
                wait: true,
                points: points,
            });
        }
        catch (error) {
            console.error('[VectorService] Failed to store chunks', error);
            throw new AppError_1.AppError('Failed to store document chunks in vector database', 500);
        }
    }
    async similaritySearch(organizationId, queryVector, options) {
        try {
            const limit = options?.limit || 5;
            const collectionName = options?.collectionName || 'knowledge_chunks';
            const mustFilters = [
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
        }
        catch (error) {
            console.error('[VectorService] Similarity search failed', error);
            throw new AppError_1.AppError('Vector search failed', 500);
        }
    }
}
exports.VectorService = VectorService;
