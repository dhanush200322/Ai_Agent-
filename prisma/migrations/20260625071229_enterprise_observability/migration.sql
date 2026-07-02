-- CreateTable
CREATE TABLE "AlertHistory" (
    "id" UUID NOT NULL,
    "organizationId" UUID,
    "alertId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertNotification" (
    "id" UUID NOT NULL,
    "organizationId" UUID,
    "alertId" UUID NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceHealth" (
    "id" UUID NOT NULL,
    "serviceName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "uptime" DOUBLE PRECISION NOT NULL,
    "memoryUsage" DOUBLE PRECISION,
    "cpuUsage" DOUBLE PRECISION,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceHealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DependencyHealth" (
    "id" UUID NOT NULL,
    "dependencyName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DependencyHealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueueHealth" (
    "id" UUID NOT NULL,
    "queueName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "activeJobs" INTEGER NOT NULL,
    "waitingJobs" INTEGER NOT NULL,
    "failedJobs" INTEGER NOT NULL,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QueueHealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatabaseHealth" (
    "id" UUID NOT NULL,
    "dbName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "connectionCount" INTEGER NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DatabaseHealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RedisHealth" (
    "id" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "usedMemory" DOUBLE PRECISION NOT NULL,
    "connectedClients" INTEGER NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RedisHealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerHealth" (
    "id" UUID NOT NULL,
    "workerId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentJobId" TEXT,
    "lastHeartbeat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkerHealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APIHealth" (
    "id" UUID NOT NULL,
    "endpoint" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "errorRate" DOUBLE PRECISION NOT NULL,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "APIHealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PluginHealth" (
    "id" UUID NOT NULL,
    "pluginId" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "errorRate" DOUBLE PRECISION NOT NULL,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PluginHealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentHealth" (
    "id" UUID NOT NULL,
    "agentId" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "errorRate" DOUBLE PRECISION NOT NULL,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentHealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowHealth" (
    "id" UUID NOT NULL,
    "workflowId" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "errorRate" DOUBLE PRECISION NOT NULL,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowHealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectorHealthHistory" (
    "id" UUID NOT NULL,
    "connectorId" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "errorRate" DOUBLE PRECISION NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConnectorHealthHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceProfile" (
    "id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "snapshotData" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PerformanceProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" UUID NOT NULL,
    "organizationId" UUID,
    "traceId" TEXT,
    "spanId" TEXT,
    "correlationId" TEXT,
    "errorCode" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "severity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExceptionEvent" (
    "id" UUID NOT NULL,
    "exceptionClass" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "serviceName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExceptionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrashReport" (
    "id" UUID NOT NULL,
    "serviceName" TEXT NOT NULL,
    "exitCode" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrashReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlowQuery" (
    "id" UUID NOT NULL,
    "query" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "tableName" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SlowQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlowRequest" (
    "id" UUID NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "traceId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SlowRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageAnalytics" (
    "id" UUID NOT NULL,
    "organizationId" UUID,
    "metricName" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenAnalytics" (
    "id" UUID NOT NULL,
    "organizationId" UUID,
    "model" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL,
    "completionTokens" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostAnalytics" (
    "id" UUID NOT NULL,
    "organizationId" UUID,
    "service" TEXT NOT NULL,
    "costUsd" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CostAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AlertHistory_alertId_idx" ON "AlertHistory"("alertId");

-- CreateIndex
CREATE INDEX "AlertNotification_alertId_idx" ON "AlertNotification"("alertId");

-- CreateIndex
CREATE INDEX "ErrorLog_traceId_idx" ON "ErrorLog"("traceId");

-- CreateIndex
CREATE INDEX "UsageAnalytics_metricName_timestamp_idx" ON "UsageAnalytics"("metricName", "timestamp");

-- AddForeignKey
ALTER TABLE "AlertHistory" ADD CONSTRAINT "AlertHistory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertNotification" ADD CONSTRAINT "AlertNotification_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorLog" ADD CONSTRAINT "ErrorLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageAnalytics" ADD CONSTRAINT "UsageAnalytics_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenAnalytics" ADD CONSTRAINT "TokenAnalytics_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostAnalytics" ADD CONSTRAINT "CostAnalytics_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
