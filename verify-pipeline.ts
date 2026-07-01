import { PrismaClient } from '@prisma/client';
import { DocumentProcessingService } from './src/modules/knowledge/services/document-processing.service';
import { VectorService } from './src/modules/knowledge/services/vector.service';
import { EmbeddingService } from './src/modules/knowledge/services/embedding.service';
import fs from 'fs';
import path from 'path';
import { RedisConnectionManager } from './src/config/redis';

const prisma = new PrismaClient();

async function cleanup() {
  try {
    await prisma.$disconnect();
  } catch (e) {}
  try {
    await RedisConnectionManager.disconnect();
  } catch (e) {}
}

process.on("uncaughtException", async (err)=>{
   console.error(err);
   await cleanup();
   process.exit(1);
});

process.on("unhandledRejection", async (err)=>{
   console.error(err);
   await cleanup();
   process.exit(1);
});

async function run() {
  const startTime = Date.now();
  console.log('=== STARTING PIPELINE VERIFICATION ===');
  try {
    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: { name: 'Pipeline Org', slug: 'pipeline-org-' + Date.now() }
      });
    }

    let user = await prisma.user.findFirst();
    if (!user) {
      let role = await prisma.role.findFirst({ where: { organizationId: org.id } });
      if (!role) {
        role = await prisma.role.create({
          data: { name: 'Admin', organizationId: org.id }
        });
      }
      user = await prisma.user.create({
        data: {
          firstName: 'Pipeline',
          lastName: 'User',
          email: `pipeline-${Date.now()}@test.com`,
          passwordHash: 'hash',
          organizationId: org.id,
          roleId: role.id
        }
      });
    }

    // @ts-ignore
    let kb = await prisma.knowledgeBase.findFirst();
    if (!kb) {
      // @ts-ignore
      kb = await prisma.knowledgeBase.create({
        data: {
          name: 'Pipeline KB',
          description: 'Pipeline Knowledge Base',
          organizationId: org.id,
          createdById: user.id
        }
      });
    }

    const testPdfPath = path.join(__dirname, 'public', 'uploads', 'test-verification.txt');
    fs.mkdirSync(path.join(__dirname, 'public', 'uploads'), { recursive: true });
    
    // Sample text mimicking document
    const textContent = `
Nexora AI is transforming how organizations work.
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
        "What is Nexora AI?",
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
    await cleanup();
    process.exit(1);
  } finally {
    const totalTime = Date.now() - startTime;
    console.log(`\n=== VERIFICATION FINISHED in ${totalTime}ms ===`);
    await cleanup();
    process.exit(0);
  }
}

run().catch(async (e) => {
  console.error(e);
  await cleanup();
  process.exit(1);
});
