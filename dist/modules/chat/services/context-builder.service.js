"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextBuilderService = void 0;
class ContextBuilderService {
    MAX_CONTEXT_LENGTH = 12000;
    /**
     * Merges Conversation Summary, Conversation Memory, and Knowledge Base Chunks
     * ensuring priority order and enforcing max context length limits.
     */
    buildContext(summary, memories, // From MemoryRetrievalService
    chunks) {
        let contextString = '';
        // 1. Conversation Summary (Highest Priority Context)
        if (summary) {
            contextString += `--- CONVERSATION SUMMARY ---\n${summary}\n\n`;
        }
        // 2. Conversation Memory
        if (memories && memories.length > 0) {
            contextString += `--- RELEVANT CONVERSATION MEMORIES ---\n`;
            for (const mem of memories) {
                const memText = `(Date: ${new Date(mem.createdAt).toISOString()}) ${mem.content}\n`;
                if (contextString.length + memText.length > this.MAX_CONTEXT_LENGTH)
                    break;
                contextString += memText;
            }
            contextString += `\n`;
        }
        // 3. Knowledge Base Chunks
        if (chunks && chunks.length > 0) {
            contextString += `--- RELEVANT KNOWLEDGE BASE ---\n`;
            const orderedChunks = [...chunks].sort((a, b) => {
                if (a.documentId === b.documentId) {
                    return a.chunkIndex - b.chunkIndex;
                }
                return a.documentId.localeCompare(b.documentId);
            });
            for (const chunk of orderedChunks) {
                const chunkText = `Document: ${chunk.fileName} (Page ${chunk.page || 1})\n${chunk.content}\n\n`;
                if (contextString.length + chunkText.length > this.MAX_CONTEXT_LENGTH)
                    break;
                contextString += chunkText;
            }
        }
        return contextString.trim();
    }
}
exports.ContextBuilderService = ContextBuilderService;
