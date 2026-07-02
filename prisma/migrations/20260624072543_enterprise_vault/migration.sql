-- CreateEnum
CREATE TYPE "VaultProviderType" AS ENUM ('DATABASE', 'AWS_SECRETS_MANAGER', 'AZURE_KEY_VAULT', 'HASHICORP_VAULT', 'GOOGLE_SECRET_MANAGER');

-- CreateEnum
CREATE TYPE "SecretStatus" AS ENUM ('ACTIVE', 'DISABLED', 'DELETED');

-- CreateEnum
CREATE TYPE "SecretCategory" AS ENUM ('AI_PROVIDER', 'DATABASE', 'PAYMENT', 'SMTP', 'OAUTH', 'PLUGIN', 'API_KEY', 'JWT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "RotationStrategy" AS ENUM ('MANUAL', 'DAILY', 'WEEKLY', 'MONTHLY', 'ON_DEMAND', 'PROVIDER_MANAGED');

-- CreateTable
CREATE TABLE "VaultSecret" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "SecretCategory" NOT NULL DEFAULT 'CUSTOM',
    "provider" "VaultProviderType" NOT NULL DEFAULT 'DATABASE',
    "status" "SecretStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VaultSecret_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VaultSecretVersion" (
    "id" UUID NOT NULL,
    "secretId" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "encryptedValue" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "authTag" TEXT NOT NULL,
    "keyVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VaultSecretVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VaultAccessLog" (
    "id" UUID NOT NULL,
    "secretId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "actorId" UUID NOT NULL,
    "actorType" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VaultAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecretRotationPolicy" (
    "id" UUID NOT NULL,
    "secretId" UUID NOT NULL,
    "strategy" "RotationStrategy" NOT NULL DEFAULT 'MANUAL',
    "cronExpression" TEXT,
    "lastRotatedAt" TIMESTAMP(3),
    "nextRotationAt" TIMESTAMP(3),
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "autoRetry" BOOLEAN NOT NULL DEFAULT true,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecretRotationPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecretLease" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "secretId" UUID NOT NULL,
    "actorId" UUID NOT NULL,
    "actorType" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecretLease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecretShare" (
    "id" UUID NOT NULL,
    "secretId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "targetActorId" UUID,
    "permission" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecretShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VaultSecret_organizationId_idx" ON "VaultSecret"("organizationId");

-- CreateIndex
CREATE INDEX "VaultSecret_status_idx" ON "VaultSecret"("status");

-- CreateIndex
CREATE UNIQUE INDEX "VaultSecret_organizationId_name_key" ON "VaultSecret"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "VaultSecretVersion_secretId_version_key" ON "VaultSecretVersion"("secretId", "version");

-- CreateIndex
CREATE INDEX "VaultAccessLog_secretId_idx" ON "VaultAccessLog"("secretId");

-- CreateIndex
CREATE INDEX "VaultAccessLog_actorId_idx" ON "VaultAccessLog"("actorId");

-- CreateIndex
CREATE INDEX "VaultAccessLog_createdAt_idx" ON "VaultAccessLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SecretRotationPolicy_secretId_key" ON "SecretRotationPolicy"("secretId");

-- CreateIndex
CREATE INDEX "SecretLease_secretId_idx" ON "SecretLease"("secretId");

-- CreateIndex
CREATE INDEX "SecretLease_expiresAt_idx" ON "SecretLease"("expiresAt");

-- CreateIndex
CREATE INDEX "SecretShare_secretId_idx" ON "SecretShare"("secretId");

-- CreateIndex
CREATE INDEX "SecretShare_organizationId_idx" ON "SecretShare"("organizationId");

-- AddForeignKey
ALTER TABLE "VaultSecret" ADD CONSTRAINT "VaultSecret_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaultSecretVersion" ADD CONSTRAINT "VaultSecretVersion_secretId_fkey" FOREIGN KEY ("secretId") REFERENCES "VaultSecret"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaultAccessLog" ADD CONSTRAINT "VaultAccessLog_secretId_fkey" FOREIGN KEY ("secretId") REFERENCES "VaultSecret"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecretRotationPolicy" ADD CONSTRAINT "SecretRotationPolicy_secretId_fkey" FOREIGN KEY ("secretId") REFERENCES "VaultSecret"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecretLease" ADD CONSTRAINT "SecretLease_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecretLease" ADD CONSTRAINT "SecretLease_secretId_fkey" FOREIGN KEY ("secretId") REFERENCES "VaultSecret"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecretShare" ADD CONSTRAINT "SecretShare_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecretShare" ADD CONSTRAINT "SecretShare_secretId_fkey" FOREIGN KEY ("secretId") REFERENCES "VaultSecret"("id") ON DELETE CASCADE ON UPDATE CASCADE;
