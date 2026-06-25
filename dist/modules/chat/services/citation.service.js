"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CitationService = void 0;
class CitationService {
    /**
     * Transforms raw retrieval results from the Vector DB into clean Citation objects
     */
    generateCitations(chunks) {
        return chunks.map((chunk) => ({
            document: chunk.fileName || 'Unknown Document',
            page: chunk.page || 1,
            chunkIndex: chunk.chunkIndex,
            score: chunk.score,
        }));
    }
}
exports.CitationService = CitationService;
