"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingService = void 0;
const transformers_1 = require("@xenova/transformers");
const AppError_1 = require("../../../shared/errors/AppError");
// Configure transformers to not download models dynamically if we don't want to,
// but for development we let it cache them locally in node_modules or cache dir.
transformers_1.env.allowLocalModels = true;
class EmbeddingService {
    model = 'Xenova/all-MiniLM-L6-v2';
    extractorPromise;
    constructor() {
        // Initialize the pipeline once as a singleton promise
        this.extractorPromise = (0, transformers_1.pipeline)('feature-extraction', this.model, {
            quantized: true, // Use quantized model for speed and lower memory
        });
    }
    async generateEmbeddings(texts) {
        if (!texts || texts.length === 0)
            return [];
        try {
            const extractor = await this.extractorPromise;
            const embeddings = [];
            // We can process sequentially or batch. 
            // all-MiniLM-L6-v2 handles batches, but for simplicity and memory limits, process sequentially
            for (const text of texts) {
                // pooling="mean" and normalize=true are standard for semantic search embeddings
                const output = await extractor(text, { pooling: 'mean', normalize: true });
                // output.data is a Float32Array containing the 384-dimensional embedding
                embeddings.push(Array.from(output.data));
            }
            return embeddings;
        }
        catch (error) {
            console.error('[EmbeddingService] Failed to generate embeddings', error);
            throw new AppError_1.AppError('Failed to generate embeddings', 500);
        }
    }
}
exports.EmbeddingService = EmbeddingService;
