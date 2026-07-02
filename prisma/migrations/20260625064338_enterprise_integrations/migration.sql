-- CreateTable
CREATE TABLE "IntegrationProvider" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationInstance" (
    "id" UUID NOT NULL,
    "providerId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "configuration" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectorDefinition" (
    "id" UUID NOT NULL,
    "providerSlug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "capabilities" TEXT NOT NULL,
    "schema" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConnectorDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectorConfiguration" (
    "id" UUID NOT NULL,
    "connectorId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "config" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConnectorConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectorCredential" (
    "id" UUID NOT NULL,
    "connectorId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "vaultKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConnectorCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectorPermission" (
    "id" UUID NOT NULL,
    "connectorId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "roleId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConnectorPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PluginEvent" (
    "id" UUID NOT NULL,
    "pluginId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PluginEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PluginLog" (
    "id" UUID NOT NULL,
    "pluginId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PluginLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PluginSchedule" (
    "id" UUID NOT NULL,
    "pluginId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "cron" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PluginSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PluginWebhook" (
    "id" UUID NOT NULL,
    "pluginId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "path" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'POST',
    "secretKey" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PluginWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OAuthConnection" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OAuthConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OAuthToken" (
    "id" UUID NOT NULL,
    "connectionId" UUID NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "scopes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OAuthToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookSubscription" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "events" TEXT NOT NULL,
    "secret" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalAccount" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalEvent" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "source" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectorHealth" (
    "id" UUID NOT NULL,
    "connectorId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "errorRate" DOUBLE PRECISION NOT NULL,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConnectorHealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectorUsage" (
    "id" UUID NOT NULL,
    "connectorId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "date" DATE NOT NULL,

    CONSTRAINT "ConnectorUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectorMetrics" (
    "id" UUID NOT NULL,
    "connectorId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "avgLatencyMs" DOUBLE PRECISION NOT NULL,
    "successRate" DOUBLE PRECISION NOT NULL,
    "totalRequests" INTEGER NOT NULL,

    CONSTRAINT "ConnectorMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectorAudit" (
    "id" UUID NOT NULL,
    "connectorId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "userId" UUID,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConnectorAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectorPolicy" (
    "id" UUID NOT NULL,
    "connectorId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "rules" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConnectorPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectorQuota" (
    "id" UUID NOT NULL,
    "connectorId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "dailyLimit" INTEGER NOT NULL,
    "monthlyLimit" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConnectorQuota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationCategory" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "IntegrationCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PluginMarketplaceEntry" (
    "id" UUID NOT NULL,
    "pluginId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PluginMarketplaceEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationProvider_name_key" ON "IntegrationProvider"("name");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationProvider_slug_key" ON "IntegrationProvider"("slug");

-- CreateIndex
CREATE INDEX "IntegrationInstance_organizationId_idx" ON "IntegrationInstance"("organizationId");

-- CreateIndex
CREATE INDEX "IntegrationInstance_providerId_idx" ON "IntegrationInstance"("providerId");

-- CreateIndex
CREATE INDEX "ConnectorConfiguration_organizationId_idx" ON "ConnectorConfiguration"("organizationId");

-- CreateIndex
CREATE INDEX "ConnectorConfiguration_connectorId_idx" ON "ConnectorConfiguration"("connectorId");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectorCredential_vaultKey_key" ON "ConnectorCredential"("vaultKey");

-- CreateIndex
CREATE INDEX "ConnectorCredential_organizationId_idx" ON "ConnectorCredential"("organizationId");

-- CreateIndex
CREATE INDEX "ConnectorCredential_connectorId_idx" ON "ConnectorCredential"("connectorId");

-- CreateIndex
CREATE INDEX "ConnectorPermission_organizationId_idx" ON "ConnectorPermission"("organizationId");

-- CreateIndex
CREATE INDEX "ConnectorPermission_connectorId_idx" ON "ConnectorPermission"("connectorId");

-- CreateIndex
CREATE INDEX "PluginEvent_organizationId_idx" ON "PluginEvent"("organizationId");

-- CreateIndex
CREATE INDEX "PluginEvent_pluginId_idx" ON "PluginEvent"("pluginId");

-- CreateIndex
CREATE INDEX "PluginLog_organizationId_idx" ON "PluginLog"("organizationId");

-- CreateIndex
CREATE INDEX "PluginLog_pluginId_idx" ON "PluginLog"("pluginId");

-- CreateIndex
CREATE INDEX "PluginSchedule_organizationId_idx" ON "PluginSchedule"("organizationId");

-- CreateIndex
CREATE INDEX "PluginSchedule_pluginId_idx" ON "PluginSchedule"("pluginId");

-- CreateIndex
CREATE INDEX "PluginWebhook_organizationId_idx" ON "PluginWebhook"("organizationId");

-- CreateIndex
CREATE INDEX "PluginWebhook_pluginId_idx" ON "PluginWebhook"("pluginId");

-- CreateIndex
CREATE INDEX "OAuthConnection_organizationId_idx" ON "OAuthConnection"("organizationId");

-- CreateIndex
CREATE INDEX "OAuthToken_connectionId_idx" ON "OAuthToken"("connectionId");

-- CreateIndex
CREATE INDEX "WebhookSubscription_organizationId_idx" ON "WebhookSubscription"("organizationId");

-- CreateIndex
CREATE INDEX "ExternalAccount_organizationId_idx" ON "ExternalAccount"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalAccount_provider_accountId_key" ON "ExternalAccount"("provider", "accountId");

-- CreateIndex
CREATE INDEX "ExternalEvent_organizationId_idx" ON "ExternalEvent"("organizationId");

-- CreateIndex
CREATE INDEX "ExternalEvent_processed_idx" ON "ExternalEvent"("processed");

-- CreateIndex
CREATE INDEX "ConnectorHealth_organizationId_idx" ON "ConnectorHealth"("organizationId");

-- CreateIndex
CREATE INDEX "ConnectorHealth_connectorId_idx" ON "ConnectorHealth"("connectorId");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectorUsage_organizationId_connectorId_action_date_key" ON "ConnectorUsage"("organizationId", "connectorId", "action", "date");

-- CreateIndex
CREATE INDEX "ConnectorMetrics_organizationId_idx" ON "ConnectorMetrics"("organizationId");

-- CreateIndex
CREATE INDEX "ConnectorMetrics_connectorId_idx" ON "ConnectorMetrics"("connectorId");

-- CreateIndex
CREATE INDEX "ConnectorAudit_organizationId_idx" ON "ConnectorAudit"("organizationId");

-- CreateIndex
CREATE INDEX "ConnectorAudit_connectorId_idx" ON "ConnectorAudit"("connectorId");

-- CreateIndex
CREATE INDEX "ConnectorPolicy_organizationId_idx" ON "ConnectorPolicy"("organizationId");

-- CreateIndex
CREATE INDEX "ConnectorPolicy_connectorId_idx" ON "ConnectorPolicy"("connectorId");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectorQuota_organizationId_connectorId_key" ON "ConnectorQuota"("organizationId", "connectorId");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationCategory_name_key" ON "IntegrationCategory"("name");

-- CreateIndex
CREATE INDEX "PluginMarketplaceEntry_pluginId_idx" ON "PluginMarketplaceEntry"("pluginId");

-- CreateIndex
CREATE INDEX "PluginMarketplaceEntry_categoryId_idx" ON "PluginMarketplaceEntry"("categoryId");

-- AddForeignKey
ALTER TABLE "IntegrationInstance" ADD CONSTRAINT "IntegrationInstance_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "IntegrationProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationInstance" ADD CONSTRAINT "IntegrationInstance_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectorConfiguration" ADD CONSTRAINT "ConnectorConfiguration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectorConfiguration" ADD CONSTRAINT "ConnectorConfiguration_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "Connector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectorCredential" ADD CONSTRAINT "ConnectorCredential_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectorCredential" ADD CONSTRAINT "ConnectorCredential_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "Connector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectorPermission" ADD CONSTRAINT "ConnectorPermission_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectorPermission" ADD CONSTRAINT "ConnectorPermission_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "Connector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PluginEvent" ADD CONSTRAINT "PluginEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PluginEvent" ADD CONSTRAINT "PluginEvent_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PluginLog" ADD CONSTRAINT "PluginLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PluginLog" ADD CONSTRAINT "PluginLog_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PluginSchedule" ADD CONSTRAINT "PluginSchedule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PluginSchedule" ADD CONSTRAINT "PluginSchedule_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PluginWebhook" ADD CONSTRAINT "PluginWebhook_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PluginWebhook" ADD CONSTRAINT "PluginWebhook_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OAuthConnection" ADD CONSTRAINT "OAuthConnection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OAuthToken" ADD CONSTRAINT "OAuthToken_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "OAuthConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookSubscription" ADD CONSTRAINT "WebhookSubscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalAccount" ADD CONSTRAINT "ExternalAccount_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalEvent" ADD CONSTRAINT "ExternalEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectorHealth" ADD CONSTRAINT "ConnectorHealth_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectorHealth" ADD CONSTRAINT "ConnectorHealth_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "Connector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectorUsage" ADD CONSTRAINT "ConnectorUsage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectorUsage" ADD CONSTRAINT "ConnectorUsage_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "Connector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectorMetrics" ADD CONSTRAINT "ConnectorMetrics_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectorMetrics" ADD CONSTRAINT "ConnectorMetrics_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "Connector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectorAudit" ADD CONSTRAINT "ConnectorAudit_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectorAudit" ADD CONSTRAINT "ConnectorAudit_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "Connector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectorPolicy" ADD CONSTRAINT "ConnectorPolicy_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectorPolicy" ADD CONSTRAINT "ConnectorPolicy_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "Connector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectorQuota" ADD CONSTRAINT "ConnectorQuota_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectorQuota" ADD CONSTRAINT "ConnectorQuota_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "Connector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PluginMarketplaceEntry" ADD CONSTRAINT "PluginMarketplaceEntry_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
