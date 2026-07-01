import { pipeline, env } from '@xenova/transformers';
import { AppError } from '../../../shared/errors/AppError';

// Configure transformers to not download models dynamically if we don't want to,
// but for development we let it cache them locally in node_modules or cache dir.
env.allowLocalModels = true;

export class EmbeddingService {
  public readonly model = 'Xenova/all-MiniLM-L6-v2';
  private static extractorPromise: Promise<any> | null = null;

  constructor() {}

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (!texts || texts.length === 0) return [];

    try {
      if (!EmbeddingService.extractorPromise) {
        EmbeddingService.extractorPromise = pipeline('feature-extraction', this.model, {
          quantized: true,
        });
      }
      
      const extractor = await EmbeddingService.extractorPromise;
      
      const embeddings: number[][] = [];
      
      // We can process sequentially or batch. 
      // all-MiniLM-L6-v2 handles batches, but for simplicity and memory limits, process sequentially
      for (const text of texts) {
        // pooling="mean" and normalize=true are standard for semantic search embeddings
        const output = await extractor(text, { pooling: 'mean', normalize: true });
        // output.data is a Float32Array containing the 384-dimensional embedding
        embeddings.push(Array.from(output.data));
      }

      return embeddings;
    } catch (error: any) {
      console.error('[EmbeddingService] Failed to generate embeddings', error);
      throw new AppError('Failed to generate embeddings', 500);
    }
  }
}
