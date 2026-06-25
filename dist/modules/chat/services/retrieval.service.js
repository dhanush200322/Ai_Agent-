"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetrievalService = void 0;
const vector_service_1 = require("../../knowledge/services/vector.service");
const embedding_service_1 = require("../../knowledge/services/embedding.service");
class RetrievalService {
    vectorService = new vector_service_1.VectorService();
    embeddingService = new embedding_service_1.EmbeddingService();
    /**
     * Retrieves relevant context chunks from Qdrant, filters out low scores,
     * removes duplicate chunks, and ranks them by similarity score.
     */
    async retrieveContext(organizationId, query, options) {
        const topK = options?.topK || 5;
        const minScore = options?.minScore || 0.2;
        // 1. Generate Query Embedding
        const queryVectors = await this.embeddingService.generateEmbeddings([query]);
        const queryVector = queryVectors[0];
        // 2. Vector Search
        // Request more to account for duplicates being filtered out
        const fetchLimit = topK * 2;
        const qdrantResults = await this.vectorService.similaritySearch(organizationId, queryVector, {
            knowledgeBaseIds: options?.knowledgeBaseIds,
            limit: fetchLimit
        });
        // 3. Score Filtering
        const filteredResults = qdrantResults.filter(res => res.score >= minScore);
        // 4. Duplicate Removal (Deduplicate by chunkId)
        const uniqueChunks = [];
        const seenChunkIds = new Set();
        for (const res of filteredResults) {
            const payload = res.payload;
            if (!payload || !payload.chunkId)
                continue;
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
exports.RetrievalService = RetrievalService;
