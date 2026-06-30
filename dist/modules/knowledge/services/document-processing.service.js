"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentProcessingService = void 0;
const client_1 = require("@prisma/client");
const document_parser_service_1 = require("./document-parser.service");
const path_1 = __importDefault(require("path"));
const text_cleaner_1 = require("../utils/text-cleaner");
const chunk_service_1 = require("./chunk.service");
const embedding_service_1 = require("./embedding.service");
const vector_service_1 = require("./vector.service");
const prisma = new client_1.PrismaClient();
class DocumentProcessingService {
    chunkService = new chunk_service_1.ChunkService(1000, 200);
    embeddingService = new embedding_service_1.EmbeddingService();
    vectorService = new vector_service_1.VectorService();
    constructor() {
        // We will ensure collection dynamically during processing
    }
    /**
     * Asynchronously process a document.
     * Extracts text, cleans it, chunks it, embeds it, stores it in Qdrant, and updates DB status.
     */
    async processDocument(documentId, reqId) {
        const startTime = Date.now();
        console.log(`[${reqId || 'SYSTEM'}] [DocumentProcessing] Started for document ${documentId}`);
        try {
            // 1. Fetch Document from DB
            // @ts-ignore
            const document = await prisma.knowledgeDocument.findUnique({
                where: { id: documentId },
            });
            if (!document) {
                throw new Error(`Document ${documentId} not found`);
            }
            // Update status to PROCESSING
            // @ts-ignore
            await prisma.knowledgeDocument.update({
                where: { id: documentId },
                data: { status: 'PROCESSING' },
            });
            // 2. Parse Source
            console.log(`[${reqId || 'SYSTEM'}] [DocumentProcessing] Parsing ${document.originalName} (${document.sourceType})`);
            let parsed = { text: '', metadata: { pages: 1 } };
            if (document.sourceType === 'DOCUMENT' || !document.sourceType) {
                if (!document.storagePath || !document.mimeType) {
                    throw new Error('DOCUMENT source missing storagePath or mimeType');
                }
                const absolutePath = path_1.default.join(__dirname, '../../../../public', document.storagePath);
                parsed = await document_parser_service_1.DocumentParserService.parse(absolutePath, document.mimeType);
            }
            else if (document.sourceType === 'WEBSITE') {
                const meta = JSON.parse(document.metadata || '{}');
                if (!meta.url)
                    throw new Error('WEBSITE source missing URL');
                console.log(`[${reqId || 'SYSTEM'}] [DocumentProcessing] Fetching URL ${meta.url}`);
                const response = await fetch(meta.url);
                const html = await response.text();
                // Basic HTML stripping, can be improved later
                parsed.text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
                    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
                    .replace(/<[^>]+>/g, ' ');
            }
            else if (document.sourceType === 'FAQ') {
                const meta = JSON.parse(document.metadata || '{}');
                const questions = meta.questions || [];
                parsed.text = questions.map((q) => `Q: ${q.question}\nA: ${q.answer}\nCategory: ${q.category || 'General'}\nTags: ${(q.tags || []).join(', ')}`).join('\n\n');
            }
            else if (document.sourceType === 'TEXT') {
                const meta = JSON.parse(document.metadata || '{}');
                parsed.text = meta.content || '';
            }
            else {
                throw new Error(`Unsupported source type: ${document.sourceType}`);
            }
            // 3. Clean Text
            console.log(`[${reqId || 'SYSTEM'}] [DocumentProcessing] Cleaning text`);
            const cleanedText = text_cleaner_1.TextCleaner.clean(parsed.text);
            if (!cleanedText) {
                throw new Error('Extracted text is empty');
            }
            // 4. Chunk Text
            console.log(`[${reqId || 'SYSTEM'}] [DocumentProcessing] Chunking text`);
            const chunks = this.chunkService.chunkText(cleanedText);
            if (chunks.length === 0) {
                throw new Error('No chunks generated from document');
            }
            // Update DB to EMBEDDING
            // @ts-ignore
            await prisma.knowledgeDocument.update({
                where: { id: documentId },
                data: { status: 'EMBEDDING' },
            });
            // 5. Generate Embeddings
            const embeddingStartTime = Date.now();
            console.log(`[${reqId || 'SYSTEM'}] [DocumentProcessing] Generating embeddings for ${chunks.length} chunks`);
            const chunkTexts = chunks.map(c => c.content);
            const embeddings = await this.embeddingService.generateEmbeddings(chunkTexts);
            const embeddingTime = Date.now() - embeddingStartTime;
            // Update DB to INDEXING
            // @ts-ignore
            await prisma.knowledgeDocument.update({
                where: { id: documentId },
                data: { status: 'INDEXING' },
            });
            // 6. Store in Vector Database
            const indexingStartTime = Date.now();
            console.log(`[${reqId || 'SYSTEM'}] [DocumentProcessing] Ensuring collection exists`);
            await this.vectorService.ensureCollection();
            console.log(`[${reqId || 'SYSTEM'}] [DocumentProcessing] Storing in Qdrant`);
            const points = chunks.map((chunk, i) => {
                const payload = {
                    id: chunk.id,
                    organizationId: document.organizationId,
                    knowledgeBaseId: document.knowledgeBaseId,
                    documentId: document.id,
                    chunkId: chunk.id,
                    chunkIndex: chunk.index,
                    content: chunk.content,
                    fileName: document.originalName,
                    mimeType: document.mimeType || 'text/plain',
                    page: parsed.metadata.pages > 1 ? Math.floor((i / chunks.length) * parsed.metadata.pages) + 1 : 1, // Rough estimate if per-page chunking isn't exact
                    createdAt: Date.now(),
                };
                return {
                    id: chunk.id, // Qdrant requires UUID
                    vector: embeddings[i],
                    payload: payload,
                };
            });
            await this.vectorService.storeChunks(points);
            const indexingTime = Date.now() - indexingStartTime;
            // 7. Update DB to COMPLETED
            const processingTime = Date.now() - startTime;
            console.log(`[${reqId || 'SYSTEM'}] [DocumentProcessing] Performance Metrics:`);
            console.log(`- Total Time: ${processingTime}ms`);
            console.log(`- Embedding Time: ${embeddingTime}ms`);
            console.log(`- Qdrant Insert Time: ${indexingTime}ms`);
            console.log(`- Chunk Count: ${chunks.length}`);
            // @ts-ignore
            await prisma.knowledgeDocument.update({
                where: { id: documentId },
                data: {
                    status: 'COMPLETED',
                    processedAt: new Date(),
                    chunkCount: chunks.length,
                    embeddingModel: this.embeddingService.model,
                    processingTime,
                },
            });
            console.log(`[${reqId || 'SYSTEM'}] [DocumentProcessing] Completed successfully in ${processingTime}ms`);
        }
        catch (error) {
            console.error(`[${reqId || 'SYSTEM'}] [DocumentProcessing] Failed for document ${documentId}:`, error);
            const processingTime = Date.now() - startTime;
            // Update DB to FAILED
            // @ts-ignore
            await prisma.knowledgeDocument.update({
                where: { id: documentId },
                data: {
                    status: 'FAILED',
                    processedAt: new Date(),
                    processingTime,
                    errorMessage: error.message || 'Unknown processing error',
                },
            }).catch((e) => console.error('Failed to update DB with FAILED status', e));
        }
    }
}
exports.DocumentProcessingService = DocumentProcessingService;
