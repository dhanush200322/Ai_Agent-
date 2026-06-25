"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedMemoryService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Note: For full RAG we would inject the real EmbeddingService and VectorService here.
// For this enterprise scaffold, we mimic the storage to validate the DB/engine flow.
class SharedMemoryService {
    async storeMemory(teamId, content, importance = 5.0) {
        // 1. In a real scenario: const embedding = await embeddingService.createEmbedding(content)
        // 2. await vectorService.upsert('team_memory', vectorId, embedding)
        const vectorId = `vec-${Date.now()}`;
        return prisma.sharedMemory.create({
            data: {
                teamId,
                embeddingId: vectorId,
                content,
                importance
            }
        });
    }
    async searchMemory(teamId, _query, topK = 3) {
        // 1. In a real scenario: const embedding = await embeddingService.createEmbedding(query)
        // 2. const matches = await vectorService.search('team_memory', embedding)
        // 3. fetch records matching those IDs
        // Mock returning latest memories for the team
        return prisma.sharedMemory.findMany({
            where: { teamId },
            orderBy: { createdAt: 'desc' },
            take: topK
        });
    }
}
exports.SharedMemoryService = SharedMemoryService;
