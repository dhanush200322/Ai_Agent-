"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamingWorker = void 0;
const prisma_1 = require("../../../shared/prisma");
class StreamingWorker {
    async processJob(job) {
        const { sessionId, chunk, status } = job.data;
        try {
            const streamSession = await prisma_1.prisma.agentStreamingSession.findFirst({
                where: { sessionId, status: 'ACTIVE' }
            });
            if (!streamSession) {
                throw new Error('No active stream session found');
            }
            // In a real application, this would push the chunk to a Redis Pub/Sub channel
            // which SSE or WebSocket servers are listening to.
            // For now, we simulate this successful push.
            return { success: true, pushedChunkSize: chunk.length };
        }
        catch (error) {
            throw error;
        }
    }
}
exports.StreamingWorker = StreamingWorker;
