/*
  Warnings:

  - You are about to drop the `ApiVersion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ApiVersion";

-- CreateTable
CREATE TABLE "DeveloperOAuthApplication" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "redirectUris" TEXT[],
    "scopes" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeveloperOAuthApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeveloperOAuthClient" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeveloperOAuthClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeveloperOAuthConsent" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "scopes" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'GRANTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeveloperOAuthConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiGateway" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiGateway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiRoute" (
    "id" UUID NOT NULL,
    "gatewayId" UUID NOT NULL,
    "path" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "authRequired" BOOLEAN NOT NULL DEFAULT true,
    "rateLimit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Developer" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Developer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeveloperOrganization" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeveloperOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeveloperProject" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeveloperProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeveloperApplication" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeveloperApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSubscription" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiPlan" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "quota" INTEGER NOT NULL,
    "rateLimit" INTEGER NOT NULL,
    "features" JSONB NOT NULL,

    CONSTRAINT "ApiPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiQuota" (
    "id" UUID NOT NULL,
    "subscriptionId" UUID NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "used" INTEGER NOT NULL DEFAULT 0,
    "limit" INTEGER NOT NULL,

    CONSTRAINT "ApiQuota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiUsage" (
    "id" UUID NOT NULL,
    "apiKeyId" UUID NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiAnalytics" (
    "id" UUID NOT NULL,
    "apiKeyId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "requests" INTEGER NOT NULL DEFAULT 0,
    "errors" INTEGER NOT NULL DEFAULT 0,
    "latencyAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "ApiAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiMetric" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "tags" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiRequest" (
    "id" UUID NOT NULL,
    "requestId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "headers" JSONB,
    "query" JSONB,
    "body" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiResponse" (
    "id" UUID NOT NULL,
    "requestId" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "headers" JSONB,
    "body" JSONB,
    "latencyMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiError" (
    "id" UUID NOT NULL,
    "requestId" TEXT NOT NULL,
    "errorCode" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiError_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiAudit" (
    "id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiWebhook" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "events" TEXT[],
    "secret" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiWebhookDelivery" (
    "id" UUID NOT NULL,
    "webhookId" UUID NOT NULL,
    "eventId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "statusCode" INTEGER,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiWebhookDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiWebhookRetry" (
    "id" UUID NOT NULL,
    "deliveryId" UUID NOT NULL,
    "attempt" INTEGER NOT NULL,
    "nextRetryAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "ApiWebhookRetry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiDocumentation" (
    "id" UUID NOT NULL,
    "version" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiDocumentation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSdk" (
    "id" UUID NOT NULL,
    "language" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiSdk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiRelease" (
    "id" UUID NOT NULL,
    "version" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "releaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiRelease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiChangelog" (
    "id" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changes" JSONB NOT NULL,

    CONSTRAINT "ApiChangelog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiDeprecation" (
    "id" UUID NOT NULL,
    "endpoint" TEXT NOT NULL,
    "announcedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sunsetAt" TIMESTAMP(3) NOT NULL,
    "alternative" TEXT,

    CONSTRAINT "ApiDeprecation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiPolicy" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rules" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "ApiPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiCache" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiTransformation" (
    "id" UUID NOT NULL,
    "routeId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "config" JSONB NOT NULL,

    CONSTRAINT "ApiTransformation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiMockServer" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "routes" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "ApiMockServer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeveloperOAuthApplication_clientId_key" ON "DeveloperOAuthApplication"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Developer_userId_key" ON "Developer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiRequest_requestId_key" ON "ApiRequest"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiResponse_requestId_key" ON "ApiResponse"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiError_requestId_key" ON "ApiError"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiCache_key_key" ON "ApiCache"("key");

-- AddForeignKey
ALTER TABLE "DeveloperOAuthApplication" ADD CONSTRAINT "DeveloperOAuthApplication_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Developer" ADD CONSTRAINT "Developer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
