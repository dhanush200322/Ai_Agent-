const { PrismaClient } = require('@prisma/client');
const { DocumentProcessingService } = require('./src/modules/knowledge/services/document-processing.service');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function run() {
  try {
    const org = await prisma.organization.findFirst();
    const user = await prisma.user.findFirst();
    const kb = await prisma.knowledgeBase.findFirst();

    if (!org || !user || !kb) {
      console.log('Missing basic data');
      return;
    }

    const testPdfPath = path.join(__dirname, 'public', 'uploads', 'test-pipeline.pdf');
    fs.mkdirSync(path.join(__dirname, 'public', 'uploads'), { recursive: true });
    fs.writeFileSync(testPdfPath, 'This is a test PDF for the processing pipeline.');

    const doc = await prisma.knowledgeDocument.create({
      data: {
        knowledgeBaseId: kb.id,
        organizationId: org.id,
        uploadedById: user.id,
        originalName: 'test-pipeline.pdf',
        fileName: 'test-pipeline.pdf',
        mimeType: 'text/plain', // simulate text parser for this fake file
        extension: 'pdf',
        size: 50,
        storagePath: '/uploads/test-pipeline.pdf',
        status: 'UPLOADED'
      }
    });

    console.log('Created test document:', doc.id);
    
    const service = new DocumentProcessingService();
    await service.processDocument(doc.id, 'TEST-REQ');

    const updatedDoc = await prisma.knowledgeDocument.findUnique({ where: { id: doc.id } });
    console.log('Final Document Status:', updatedDoc.status);
    console.log('Error Message:', updatedDoc.errorMessage);
    console.log('Chunk Count:', updatedDoc.chunkCount);
    console.log('Processing Time:', updatedDoc.processingTime);
  } catch (err) {
    console.error('Test failed', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
