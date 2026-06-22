import { PrismaClient } from '@prisma/client';
import { DocumentProcessingService } from './src/modules/knowledge/services/document-processing.service';
import { VectorService } from './src/modules/knowledge/services/vector.service';
import { EmbeddingService } from './src/modules/knowledge/services/embedding.service';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function run() {
  const startTime = Date.now();
  console.log('=== STARTING PIPELINE VERIFICATION ===');
  try {
    const org = await prisma.organization.findFirst();
    const user = await prisma.user.findFirst();
    // @ts-ignore
    const kb = await prisma.knowledgeBase.findFirst();

    if (!org || !user || !kb) {
      console.log('Missing basic data. Please seed DB.');
      return;
    }

    const testPdfPath = path.join(__dirname, 'public', 'uploads', 'test-verification.txt');
    fs.mkdirSync(path.join(__dirname, 'public', 'uploads'), { recursive: true });
    
    // Sample text mimicking document
    const textContent = `
Enterprise AI is transforming how organizations work.
It uses advanced agents to retrieve knowledge, automate workflows, and answer questions.
This is a test document demonstrating knowledge base ingestion and semantic search capabilities.
Authentication relies on secure JWT tokens.
    `.trim();

    fs.writeFileSync(testPdfPath, textContent);

    // @ts-ignore
    const doc = await prisma.knowledgeDocument.create({
      data: {
        knowledgeBaseId: kb.id,
        organizationId: org.id,
        uploadedById: user.id,
        originalName: 'test-verification.txt',
        fileName: 'test-verification.txt',
        mimeType: 'text/plain',
        extension: 'txt',
        size: textContent.length,
        storagePath: '/uploads/test-verification.txt',
        status: 'UPLOADED'
      }
    });

    console.log(`\n[+] Created test document: ${doc.id}`);
    
    // 1. Process Document
    const service = new DocumentProcessingService();
    await service.processDocument(doc.id, 'VERIFY');

    // 2. Fetch updated DB Status
    // @ts-ignore
    const updatedDoc = await prisma.knowledgeDocument.findUnique({ where: { id: doc.id } });
    console.log('\n=== DB Verification ===');
    console.log('Status:', updatedDoc?.status);
    console.log('Error Message:', updatedDoc?.errorMessage || 'None');
    console.log('Chunk Count:', updatedDoc?.chunkCount);
    console.log('Processing Time:', updatedDoc?.processingTime, 'ms');
    console.log('Embedding Model:', updatedDoc?.embeddingModel);

    // 3. Similarity Search Verification
    if (updatedDoc?.status === 'COMPLETED') {
      console.log('\n=== Similarity Search Verification ===');
      
      const embeddingService = new EmbeddingService();
      const vectorService = new VectorService();
      
      const queries = [
        "What is Enterprise AI?",
        "How does authentication work?",
        "What does this document demonstrate?"
      ];

      for (const query of queries) {
        console.log(`\nQuery: "${query}"`);
        const queryVector = await embeddingService.generateEmbeddings([query]);
        
        const results = await vectorService.similaritySearch(
          org.id,
          queryVector[0],
          {
            knowledgeBaseIds: [kb.id],
            limit: 3
          }
        );

        console.log(`Found ${results.length} chunks.`);
        results.forEach((res, index) => {
          console.log(`  [${index + 1}] Score: ${res.score.toFixed(4)}`);
          console.log(`      Content: "${(res.payload as any)?.content}"`);
        });
      }
    }

  } catch (err) {
    console.error('Test failed', err);
  } finally {
    await prisma.$disconnect();
    const totalTime = Date.now() - startTime;
    console.log(`\n=== VERIFICATION FINISHED in ${totalTime}ms ===`);
  }
}

run();
