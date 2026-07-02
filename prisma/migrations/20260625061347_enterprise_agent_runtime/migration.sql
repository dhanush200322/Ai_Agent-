-- CreateEnum
CREATE TYPE "AgentExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'PAUSED', 'COMPLETED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "DelegationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "AgentEventType" AS ENUM ('START', 'STEP', 'TOOL_CALL', 'TOOL_RESULT', 'DELEGATION', 'PAUSE', 'RESUME', 'COMPLETE', 'ERROR');

-- CreateEnum
CREATE TYPE "LockStatus" AS ENUM ('ACQUIRED', 'RELEASED', 'EXPIRED');

-- AlterEnum
ALTER TYPE "JobType" ADD VALUE 'AGENT_RUNTIME';

-- CreateTable
CREATE TABLE "AgentRuntimeConfiguration" (
    "id" UUID NOT NULL,
    "agentId" UUID NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "maxIterations" INTEGER NOT NULL DEFAULT 10,
    "executionTimeout" INTEGER NOT NULL DEFAULT 60000,
    "maxTokens" INTEGER NOT NULL DEFAULT 4096,
    "modelRouting" TEXT,
    "fallbackModels" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentRuntimeConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentPolicy" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rules" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentExecution" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "agentId" UUID NOT NULL,
    "sessionId" UUID,
    "status" "AgentExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "goal" TEXT NOT NULL,
    "result" TEXT,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentExecutionStep" (
    "id" UUID NOT NULL,
    "executionId" UUID NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "thought" TEXT,
    "action" TEXT,
    "observation" TEXT,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentExecutionStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentSession" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "agentId" UUID NOT NULL,
    "userId" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "AgentSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentDelegation" (
    "id" UUID NOT NULL,
    "sourceAgentId" UUID NOT NULL,
    "targetAgentId" UUID NOT NULL,
    "taskId" UUID,
    "status" "DelegationStatus" NOT NULL DEFAULT 'PENDING',
    "taskDefinition" TEXT NOT NULL,
    "result" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentDelegation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentCheckpoint" (
    "id" UUID NOT NULL,
    "executionId" UUID NOT NULL,
    "state" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentCheckpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentExecutionSnapshot" (
    "id" UUID NOT NULL,
    "executionId" UUID NOT NULL,
    "data" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentExecutionSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentContext" (
    "id" UUID NOT NULL,
    "agentId" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentContext_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentState" (
    "id" UUID NOT NULL,
    "agentId" UUID NOT NULL,
    "state" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentEvent" (
    "id" UUID NOT NULL,
    "agentId" UUID NOT NULL,
    "type" "AgentEventType" NOT NULL,
    "payload" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentExecutionLog" (
    "id" UUID NOT NULL,
    "executionId" UUID NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentExecutionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentResourceLock" (
    "id" UUID NOT NULL,
    "resourceId" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "status" "LockStatus" NOT NULL DEFAULT 'ACQUIRED',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentResourceLock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentHeartbeat" (
    "id" UUID NOT NULL,
    "agentId" UUID NOT NULL,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "metadata" TEXT,

    CONSTRAINT "AgentHeartbeat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentPerformanceMetrics" (
    "id" UUID NOT NULL,
    "executionId" UUID NOT NULL,
    "totalLatency" INTEGER NOT NULL,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "totalCost" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentPerformanceMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentStreamingSession" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "connectionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "AgentStreamingSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgentRuntimeConfiguration_agentId_key" ON "AgentRuntimeConfiguration"("agentId");

-- CreateIndex
CREATE INDEX "AgentPolicy_organizationId_idx" ON "AgentPolicy"("organizationId");

-- CreateIndex
CREATE INDEX "AgentExecution_organizationId_idx" ON "AgentExecution"("organizationId");

-- CreateIndex
CREATE INDEX "AgentExecution_agentId_idx" ON "AgentExecution"("agentId");

-- CreateIndex
CREATE INDEX "AgentExecution_status_idx" ON "AgentExecution"("status");

-- CreateIndex
CREATE INDEX "AgentExecutionStep_executionId_idx" ON "AgentExecutionStep"("executionId");

-- CreateIndex
CREATE INDEX "AgentExecutionStep_stepNumber_idx" ON "AgentExecutionStep"("stepNumber");

-- CreateIndex
CREATE INDEX "AgentSession_organizationId_idx" ON "AgentSession"("organizationId");

-- CreateIndex
CREATE INDEX "AgentSession_agentId_idx" ON "AgentSession"("agentId");

-- CreateIndex
CREATE INDEX "AgentDelegation_sourceAgentId_idx" ON "AgentDelegation"("sourceAgentId");

-- CreateIndex
CREATE INDEX "AgentDelegation_targetAgentId_idx" ON "AgentDelegation"("targetAgentId");

-- CreateIndex
CREATE INDEX "AgentDelegation_status_idx" ON "AgentDelegation"("status");

-- CreateIndex
CREATE INDEX "AgentCheckpoint_executionId_idx" ON "AgentCheckpoint"("executionId");

-- CreateIndex
CREATE INDEX "AgentExecutionSnapshot_executionId_idx" ON "AgentExecutionSnapshot"("executionId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentContext_agentId_key_key" ON "AgentContext"("agentId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "AgentState_agentId_key" ON "AgentState"("agentId");

-- CreateIndex
CREATE INDEX "AgentEvent_agentId_idx" ON "AgentEvent"("agentId");

-- CreateIndex
CREATE INDEX "AgentEvent_timestamp_idx" ON "AgentEvent"("timestamp");

-- CreateIndex
CREATE INDEX "AgentExecutionLog_executionId_idx" ON "AgentExecutionLog"("executionId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentResourceLock_resourceId_key" ON "AgentResourceLock"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentHeartbeat_agentId_key" ON "AgentHeartbeat"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentPerformanceMetrics_executionId_key" ON "AgentPerformanceMetrics"("executionId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentStreamingSession_connectionId_key" ON "AgentStreamingSession"("connectionId");

-- CreateIndex
CREATE INDEX "AgentStreamingSession_sessionId_idx" ON "AgentStreamingSession"("sessionId");

-- AddForeignKey
ALTER TABLE "AgentRuntimeConfiguration" ADD CONSTRAINT "AgentRuntimeConfiguration_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentPolicy" ADD CONSTRAINT "AgentPolicy_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentExecution" ADD CONSTRAINT "AgentExecution_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentExecution" ADD CONSTRAINT "AgentExecution_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentExecution" ADD CONSTRAINT "AgentExecution_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AgentSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentExecutionStep" ADD CONSTRAINT "AgentExecutionStep_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "AgentExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentSession" ADD CONSTRAINT "AgentSession_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentSession" ADD CONSTRAINT "AgentSession_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentSession" ADD CONSTRAINT "AgentSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentDelegation" ADD CONSTRAINT "AgentDelegation_sourceAgentId_fkey" FOREIGN KEY ("sourceAgentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentDelegation" ADD CONSTRAINT "AgentDelegation_targetAgentId_fkey" FOREIGN KEY ("targetAgentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentDelegation" ADD CONSTRAINT "AgentDelegation_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "AgentTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentCheckpoint" ADD CONSTRAINT "AgentCheckpoint_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "AgentExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentExecutionSnapshot" ADD CONSTRAINT "AgentExecutionSnapshot_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "AgentExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentContext" ADD CONSTRAINT "AgentContext_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentState" ADD CONSTRAINT "AgentState_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentEvent" ADD CONSTRAINT "AgentEvent_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentExecutionLog" ADD CONSTRAINT "AgentExecutionLog_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "AgentExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentHeartbeat" ADD CONSTRAINT "AgentHeartbeat_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentPerformanceMetrics" ADD CONSTRAINT "AgentPerformanceMetrics_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "AgentExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentStreamingSession" ADD CONSTRAINT "AgentStreamingSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AgentSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
