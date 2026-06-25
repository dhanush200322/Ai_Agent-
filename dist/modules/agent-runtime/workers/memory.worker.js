"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryWorker = void 0;
const memory_engine_1 = require("../engine/memory.engine");
const memoryEngine = new memory_engine_1.MemoryEngine();
class MemoryWorker {
    async processJob(job) {
        const { action, organizationId, agentId, conversationId, content } = job.data;
        try {
            if (action === 'ADD_EPISODIC') {
                await memoryEngine.addEpisodicMemory(organizationId, agentId, conversationId, content);
            }
            else if (action === 'SUMMARIZE_SESSION') {
                return await memoryEngine.summarizeSession(organizationId, agentId, conversationId);
            }
        }
        catch (error) {
            throw error;
        }
    }
}
exports.MemoryWorker = MemoryWorker;
