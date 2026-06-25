"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryService = void 0;
const client_1 = require("@prisma/client");
const embedding_service_1 = require("../../knowledge/services/embedding.service");
const vector_service_1 = require("../../knowledge/services/vector.service");
const prisma = new client_1.PrismaClient();
const embeddingService = new embedding_service_1.EmbeddingService();
const vectorService = new vector_service_1.VectorService();
class MemoryService {
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
    calculateImportance(content, role) {
        let score = 50; // Base score
        // User messages are slightly more important for context
        if (role === 'USER')
            score += 10;
        // Longer messages usually hold more substance, up to a point
        const length = content.length;
        if (length > 100)
            score += 10;
        if (length > 500)
            score += 10;
        // Explicit keywords
        const keywords = ['remember', 'important', 'crucial', 'always', 'never', 'secret', 'password', 'key'];
        const lowerContent = content.toLowerCase();
        for (const kw of keywords) {
            if (lowerContent.includes(kw))
                score += 5;
        }
        return Math.min(score, 100);
    }
    /**
     * Save a new memory
     */
    async saveMemory(data) {
        // 1. Calculate Importance
        const importance = this.calculateImportance(data.content, data.role);
        // 2. Generate Embedding
        const embeddings = await embeddingService.generateEmbeddings([data.content]);
        const vector = embeddings[0];
        // 3. Save to Prisma
        const memory = await prisma.conversationMemory.create({
            data: {
                conversationId: data.conversationId,
                organizationId: data.organizationId,
                agentId: data.agentId,
                messageId: data.messageId,
                content: data.content,
                embeddingModel: 'Xenova/all-MiniLM-L6-v2', // Match embedding service model
                vectorId: '', // Will update
                memoryType: data.memoryType || 'SHORT_TERM',
                importance
            }
        });
        // We use the Prisma ID as the Vector UUID
        const vectorId = memory.id;
        await prisma.conversationMemory.update({
            where: { id: memory.id },
            data: { vectorId }
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
exports.MemoryService = MemoryService;
