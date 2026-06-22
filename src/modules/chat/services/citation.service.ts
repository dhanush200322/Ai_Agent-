import { Citation, RetrievalResult } from '../types/chat.types';

export class CitationService {
  /**
   * Transforms raw retrieval results from the Vector DB into clean Citation objects
   */
  generateCitations(chunks: RetrievalResult[]): Citation[] {
    return chunks.map((chunk) => ({
      document: chunk.fileName || 'Unknown Document',
      page: chunk.page || 1,
      chunkIndex: chunk.chunkIndex,
      score: chunk.score,
    }));
  }
}
