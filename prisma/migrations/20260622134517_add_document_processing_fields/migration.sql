-- AlterTable
ALTER TABLE "KnowledgeDocument" ADD COLUMN     "chunkCount" INTEGER,
ADD COLUMN     "embeddingModel" TEXT,
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "processingTime" INTEGER;
