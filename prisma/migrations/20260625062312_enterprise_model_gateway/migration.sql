-- CreateTable
CREATE TABLE "AIProvider" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderCredentialReference" (
    "id" UUID NOT NULL,
    "providerId" UUID NOT NULL,
    "vaultSecretId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderCredentialReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIModel" (
    "id" UUID NOT NULL,
    "providerId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "contextWindow" INTEGER NOT NULL,
    "maxOutputTokens" INTEGER NOT NULL,
    "inputCostPer1k" DECIMAL(10,6) NOT NULL,
    "outputCostPer1k" DECIMAL(10,6) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFallback" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIModelCapability" (
    "id" UUID NOT NULL,
    "modelId" UUID NOT NULL,
    "capability" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIModelCapability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptLibrary" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromptLibrary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptCategory" (
    "id" UUID NOT NULL,
    "libraryId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptTemplate" (
    "id" UUID NOT NULL,
    "libraryId" UUID NOT NULL,
    "categoryId" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromptTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptVersion" (
    "id" UUID NOT NULL,
    "templateId" UUID NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "modelId" UUID,
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "topP" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "maxTokens" INTEGER NOT NULL DEFAULT 2048,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptVariable" (
    "id" UUID NOT NULL,
    "versionId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptVariable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptApproval" (
    "id" UUID NOT NULL,
    "versionId" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "reviewerId" UUID NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptAudit" (
    "id" UUID NOT NULL,
    "versionId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptExecution" (
    "id" UUID NOT NULL,
    "templateId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "userId" UUID,
    "variables" TEXT,
    "result" TEXT,
    "latency" INTEGER,
    "tokensUsed" INTEGER,
    "cost" DECIMAL(10,6),
    "status" TEXT NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptCache" (
    "id" UUID NOT NULL,
    "hashKey" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromptCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelUsage" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "model" TEXT NOT NULL,
    "tokens" INTEGER NOT NULL,
    "cost" DECIMAL(10,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModelUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelCost" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "model" TEXT NOT NULL,
    "totalCost" DECIMAL(10,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModelCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelHealth" (
    "id" UUID NOT NULL,
    "modelId" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "latency" INTEGER NOT NULL,
    "errorRate" DOUBLE PRECISION NOT NULL,
    "lastChecked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModelHealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelFallback" (
    "id" UUID NOT NULL,
    "primaryModelId" UUID NOT NULL,
    "fallbackModelId" UUID NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModelFallback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelRoutingRule" (
    "id" UUID NOT NULL,
    "modelId" UUID NOT NULL,
    "criteria" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "trafficPct" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModelRoutingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelQuota" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "model" TEXT NOT NULL,
    "dailyLimit" INTEGER NOT NULL,
    "monthlyLimit" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModelQuota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenUsage" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "promptTokens" INTEGER NOT NULL,
    "completionTokens" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompletionLog" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "model" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "completion" TEXT,
    "latencyMs" INTEGER,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompletionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreamingSession" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "model" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "StreamingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmbeddingExecution" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "model" TEXT NOT NULL,
    "inputLength" INTEGER NOT NULL,
    "tokensUsed" INTEGER NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmbeddingExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImageGenerationExecution" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "model" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImageGenerationExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudioGenerationExecution" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "model" TEXT NOT NULL,
    "text" TEXT,
    "audioLengthSec" INTEGER,
    "latencyMs" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AudioGenerationExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelPerformanceMetrics" (
    "id" UUID NOT NULL,
    "model" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "avgLatency" DOUBLE PRECISION NOT NULL,
    "errorRate" DOUBLE PRECISION NOT NULL,
    "p95Latency" DOUBLE PRECISION NOT NULL,
    "p99Latency" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ModelPerformanceMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelFeedback" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "model" TEXT NOT NULL,
    "thumbsUp" BOOLEAN NOT NULL DEFAULT false,
    "thumbsDown" BOOLEAN NOT NULL DEFAULT false,
    "rating" INTEGER,
    "comment" TEXT,
    "preferredModel" TEXT,
    "responseQuality" DOUBLE PRECISION,
    "latencyScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModelFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIProvider_organizationId_idx" ON "AIProvider"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "AIProvider_organizationId_name_key" ON "AIProvider"("organizationId", "name");

-- CreateIndex
CREATE INDEX "AIModel_providerId_idx" ON "AIModel"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "AIModel_providerId_modelId_key" ON "AIModel"("providerId", "modelId");

-- CreateIndex
CREATE UNIQUE INDEX "AIModelCapability_modelId_capability_key" ON "AIModelCapability"("modelId", "capability");

-- CreateIndex
CREATE INDEX "PromptLibrary_organizationId_idx" ON "PromptLibrary"("organizationId");

-- CreateIndex
CREATE INDEX "PromptCategory_libraryId_idx" ON "PromptCategory"("libraryId");

-- CreateIndex
CREATE INDEX "PromptTemplate_libraryId_idx" ON "PromptTemplate"("libraryId");

-- CreateIndex
CREATE INDEX "PromptTemplate_categoryId_idx" ON "PromptTemplate"("categoryId");

-- CreateIndex
CREATE INDEX "PromptVersion_templateId_idx" ON "PromptVersion"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "PromptVersion_templateId_versionNumber_key" ON "PromptVersion"("templateId", "versionNumber");

-- CreateIndex
CREATE INDEX "PromptVariable_versionId_idx" ON "PromptVariable"("versionId");

-- CreateIndex
CREATE INDEX "PromptApproval_versionId_idx" ON "PromptApproval"("versionId");

-- CreateIndex
CREATE INDEX "PromptAudit_versionId_idx" ON "PromptAudit"("versionId");

-- CreateIndex
CREATE INDEX "PromptExecution_templateId_idx" ON "PromptExecution"("templateId");

-- CreateIndex
CREATE INDEX "PromptExecution_organizationId_idx" ON "PromptExecution"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "PromptCache_hashKey_key" ON "PromptCache"("hashKey");

-- CreateIndex
CREATE INDEX "PromptCache_hashKey_idx" ON "PromptCache"("hashKey");

-- CreateIndex
CREATE INDEX "ModelUsage_organizationId_idx" ON "ModelUsage"("organizationId");

-- CreateIndex
CREATE INDEX "ModelUsage_model_idx" ON "ModelUsage"("model");

-- CreateIndex
CREATE INDEX "ModelUsage_createdAt_idx" ON "ModelUsage"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ModelCost_organizationId_date_model_key" ON "ModelCost"("organizationId", "date", "model");

-- CreateIndex
CREATE INDEX "ModelHealth_modelId_idx" ON "ModelHealth"("modelId");

-- CreateIndex
CREATE INDEX "ModelFallback_primaryModelId_idx" ON "ModelFallback"("primaryModelId");

-- CreateIndex
CREATE INDEX "ModelRoutingRule_modelId_idx" ON "ModelRoutingRule"("modelId");

-- CreateIndex
CREATE UNIQUE INDEX "ModelQuota_organizationId_model_key" ON "ModelQuota"("organizationId", "model");

-- CreateIndex
CREATE INDEX "TokenUsage_organizationId_idx" ON "TokenUsage"("organizationId");

-- CreateIndex
CREATE INDEX "CompletionLog_organizationId_idx" ON "CompletionLog"("organizationId");

-- CreateIndex
CREATE INDEX "CompletionLog_model_idx" ON "CompletionLog"("model");

-- CreateIndex
CREATE INDEX "StreamingSession_organizationId_idx" ON "StreamingSession"("organizationId");

-- CreateIndex
CREATE INDEX "EmbeddingExecution_organizationId_idx" ON "EmbeddingExecution"("organizationId");

-- CreateIndex
CREATE INDEX "ImageGenerationExecution_organizationId_idx" ON "ImageGenerationExecution"("organizationId");

-- CreateIndex
CREATE INDEX "AudioGenerationExecution_organizationId_idx" ON "AudioGenerationExecution"("organizationId");

-- CreateIndex
CREATE INDEX "ModelPerformanceMetrics_model_idx" ON "ModelPerformanceMetrics"("model");

-- CreateIndex
CREATE INDEX "ModelPerformanceMetrics_timestamp_idx" ON "ModelPerformanceMetrics"("timestamp");

-- CreateIndex
CREATE INDEX "ModelFeedback_organizationId_idx" ON "ModelFeedback"("organizationId");

-- CreateIndex
CREATE INDEX "ModelFeedback_model_idx" ON "ModelFeedback"("model");

-- AddForeignKey
ALTER TABLE "AIProvider" ADD CONSTRAINT "AIProvider_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderCredentialReference" ADD CONSTRAINT "ProviderCredentialReference_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "AIProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIModel" ADD CONSTRAINT "AIModel_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "AIProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIModelCapability" ADD CONSTRAINT "AIModelCapability_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AIModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptLibrary" ADD CONSTRAINT "PromptLibrary_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptCategory" ADD CONSTRAINT "PromptCategory_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "PromptLibrary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptTemplate" ADD CONSTRAINT "PromptTemplate_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "PromptLibrary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptTemplate" ADD CONSTRAINT "PromptTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PromptCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptVersion" ADD CONSTRAINT "PromptVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "PromptTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptVariable" ADD CONSTRAINT "PromptVariable_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "PromptVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptApproval" ADD CONSTRAINT "PromptApproval_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "PromptVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptAudit" ADD CONSTRAINT "PromptAudit_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "PromptVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptExecution" ADD CONSTRAINT "PromptExecution_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "PromptTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptExecution" ADD CONSTRAINT "PromptExecution_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelUsage" ADD CONSTRAINT "ModelUsage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelCost" ADD CONSTRAINT "ModelCost_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelHealth" ADD CONSTRAINT "ModelHealth_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AIModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelFallback" ADD CONSTRAINT "ModelFallback_primaryModelId_fkey" FOREIGN KEY ("primaryModelId") REFERENCES "AIModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelRoutingRule" ADD CONSTRAINT "ModelRoutingRule_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AIModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelQuota" ADD CONSTRAINT "ModelQuota_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenUsage" ADD CONSTRAINT "TokenUsage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompletionLog" ADD CONSTRAINT "CompletionLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamingSession" ADD CONSTRAINT "StreamingSession_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmbeddingExecution" ADD CONSTRAINT "EmbeddingExecution_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageGenerationExecution" ADD CONSTRAINT "ImageGenerationExecution_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioGenerationExecution" ADD CONSTRAINT "AudioGenerationExecution_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelFeedback" ADD CONSTRAINT "ModelFeedback_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
