import { PrismaClient } from '@prisma/client';
import { DocumentParserService } from './document-parser.service';
import path from 'path';
import { TextCleaner } from '../utils/text-cleaner';
import { ChunkService } from './chunk.service';
import { EmbeddingService } from './embedding.service';
import { VectorService, VectorPayload } from './vector.service';

const prisma = new PrismaClient();

export class DocumentProcessingService {
  private chunkService = new ChunkService(1000, 200);
  private embeddingService = new EmbeddingService();
  private vectorService = new VectorService();

  constructor() {
    // We will ensure collection dynamically during processing
  }

  /**
   * Asynchronously process a document.
   * Extracts text, cleans it, chunks it, embeds it, stores it in Qdrant, and updates DB status.
   */
  async processDocument(documentId: string, reqId?: string): Promise<void> {
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

      // 2. Parse Document
      console.log(`[${reqId || 'SYSTEM'}] [DocumentProcessing] Parsing ${document.originalName}`);
      
      const absolutePath = path.join(__dirname, '../../../../public', document.storagePath);
      const parsed = await DocumentParserService.parse(absolutePath, document.mimeType);

      // 3. Clean Text
      console.log(`[${reqId || 'SYSTEM'}] [DocumentProcessing] Cleaning text`);
      const cleanedText = TextCleaner.clean(parsed.text);

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
        const payload: VectorPayload = {
          id: chunk.id,
          organizationId: document.organizationId,
          knowledgeBaseId: document.knowledgeBaseId,
          documentId: document.id,
          chunkId: chunk.id,
          chunkIndex: chunk.index,
          content: chunk.content,
          fileName: document.originalName,
          mimeType: document.mimeType,
          page: parsed.metadata.pages > 1 ? Math.floor((i / chunks.length) * parsed.metadata.pages) + 1 : 1, // Rough estimate if per-page chunking isn't exact
          createdAt: Date.now(),
        };

        return {
          id: chunk.id, // Qdrant requires UUID
          vector: embeddings[i],
          payload: payload as any,
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

    } catch (error: any) {
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
      }).catch((e: any) => console.error('Failed to update DB with FAILED status', e));
    }
  }
}
