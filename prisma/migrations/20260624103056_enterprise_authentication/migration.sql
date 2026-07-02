-- CreateEnum
CREATE TYPE "AuthenticationProvider" AS ENUM ('LOCAL', 'GOOGLE', 'MICROSOFT', 'OKTA', 'AUTH0', 'GITHUB', 'SAML', 'LDAP');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'REVOKED', 'EXPIRED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "DeviceTrustLevel" AS ENUM ('TRUSTED', 'UNTRUSTED', 'SUSPICIOUS', 'BLOCKED');

-- CreateEnum
CREATE TYPE "MFAType" AS ENUM ('TOTP', 'EMAIL', 'SMS', 'BACKUP_CODE', 'SECURITY_KEY');

-- CreateEnum
CREATE TYPE "LoginEventType" AS ENUM ('LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'TOKEN_REFRESH', 'MFA_CHALLENGE', 'MFA_SUCCESS', 'MFA_FAILED', 'ACCOUNT_LOCKED', 'PASSWORD_RESET');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "UserSession" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "deviceId" UUID,
    "tokenFingerprint" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "riskScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "replacedByToken" TEXT,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustedDevice" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "deviceFingerprint" TEXT NOT NULL,
    "name" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "trustLevel" "DeviceTrustLevel" NOT NULL DEFAULT 'UNTRUSTED',
    "lastIpAddress" TEXT,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrustedDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMFA" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "MFAType" NOT NULL,
    "secret" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMFA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecoveryCode" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "codeHash" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecoveryCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentityProviderAccount" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "provider" "AuthenticationProvider" NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "email" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdentityProviderAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginHistory" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "eventType" "LoginEventType" NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "location" TEXT,
    "riskScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" TEXT NOT NULL,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionAudit" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthenticationPolicy" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "requireMfa" BOOLEAN NOT NULL DEFAULT false,
    "mfaEnforcementLevel" TEXT NOT NULL,
    "sessionTimeoutMins" INTEGER NOT NULL DEFAULT 1440,
    "idleTimeoutMins" INTEGER NOT NULL DEFAULT 60,
    "maxConcurrentSessions" INTEGER NOT NULL DEFAULT 5,
    "passwordMinLength" INTEGER NOT NULL DEFAULT 12,
    "passwordRequireNum" BOOLEAN NOT NULL DEFAULT true,
    "passwordRequireSym" BOOLEAN NOT NULL DEFAULT true,
    "passwordRequireUpper" BOOLEAN NOT NULL DEFAULT true,
    "passwordExpiryDays" INTEGER NOT NULL DEFAULT 90,
    "passwordHistoryCount" INTEGER NOT NULL DEFAULT 5,
    "lockoutThreshold" INTEGER NOT NULL DEFAULT 5,
    "lockoutDurationMins" INTEGER NOT NULL DEFAULT 30,
    "enforceGeoRestriction" BOOLEAN NOT NULL DEFAULT false,
    "enforceIpRestriction" BOOLEAN NOT NULL DEFAULT false,
    "enforceWorkingHours" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthenticationPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IPRange" (
    "id" UUID NOT NULL,
    "policyId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "cidr" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IPRange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeoRestriction" (
    "id" UUID NOT NULL,
    "policyId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeoRestriction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkingHoursPolicy" (
    "id" UUID NOT NULL,
    "policyId" UUID NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "monday" BOOLEAN NOT NULL DEFAULT true,
    "tuesday" BOOLEAN NOT NULL DEFAULT true,
    "wednesday" BOOLEAN NOT NULL DEFAULT true,
    "thursday" BOOLEAN NOT NULL DEFAULT true,
    "friday" BOOLEAN NOT NULL DEFAULT true,
    "saturday" BOOLEAN NOT NULL DEFAULT false,
    "sunday" BOOLEAN NOT NULL DEFAULT false,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkingHoursPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_tokenFingerprint_key" ON "UserSession"("tokenFingerprint");

-- CreateIndex
CREATE INDEX "UserSession_userId_idx" ON "UserSession"("userId");

-- CreateIndex
CREATE INDEX "UserSession_tokenFingerprint_idx" ON "UserSession"("tokenFingerprint");

-- CreateIndex
CREATE INDEX "UserSession_status_idx" ON "UserSession"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_sessionId_idx" ON "RefreshToken"("sessionId");

-- CreateIndex
CREATE INDEX "RefreshToken_tokenHash_idx" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "TrustedDevice_deviceFingerprint_key" ON "TrustedDevice"("deviceFingerprint");

-- CreateIndex
CREATE INDEX "TrustedDevice_userId_idx" ON "TrustedDevice"("userId");

-- CreateIndex
CREATE INDEX "TrustedDevice_deviceFingerprint_idx" ON "TrustedDevice"("deviceFingerprint");

-- CreateIndex
CREATE UNIQUE INDEX "UserMFA_userId_type_key" ON "UserMFA"("userId", "type");

-- CreateIndex
CREATE INDEX "RecoveryCode_userId_idx" ON "RecoveryCode"("userId");

-- CreateIndex
CREATE INDEX "IdentityProviderAccount_userId_idx" ON "IdentityProviderAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "IdentityProviderAccount_provider_providerUserId_key" ON "IdentityProviderAccount"("provider", "providerUserId");

-- CreateIndex
CREATE INDEX "LoginHistory_userId_idx" ON "LoginHistory"("userId");

-- CreateIndex
CREATE INDEX "LoginHistory_createdAt_idx" ON "LoginHistory"("createdAt");

-- CreateIndex
CREATE INDEX "SessionAudit_sessionId_idx" ON "SessionAudit"("sessionId");

-- CreateIndex
CREATE INDEX "SessionAudit_userId_idx" ON "SessionAudit"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthenticationPolicy_organizationId_key" ON "AuthenticationPolicy"("organizationId");

-- CreateIndex
CREATE INDEX "IPRange_policyId_idx" ON "IPRange"("policyId");

-- CreateIndex
CREATE INDEX "IPRange_type_idx" ON "IPRange"("type");

-- CreateIndex
CREATE INDEX "GeoRestriction_policyId_idx" ON "GeoRestriction"("policyId");

-- CreateIndex
CREATE INDEX "WorkingHoursPolicy_policyId_idx" ON "WorkingHoursPolicy"("policyId");

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "TrustedDevice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "UserSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustedDevice" ADD CONSTRAINT "TrustedDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMFA" ADD CONSTRAINT "UserMFA_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryCode" ADD CONSTRAINT "RecoveryCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentityProviderAccount" ADD CONSTRAINT "IdentityProviderAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginHistory" ADD CONSTRAINT "LoginHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionAudit" ADD CONSTRAINT "SessionAudit_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "UserSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionAudit" ADD CONSTRAINT "SessionAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthenticationPolicy" ADD CONSTRAINT "AuthenticationPolicy_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IPRange" ADD CONSTRAINT "IPRange_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "AuthenticationPolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeoRestriction" ADD CONSTRAINT "GeoRestriction_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "AuthenticationPolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkingHoursPolicy" ADD CONSTRAINT "WorkingHoursPolicy_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "AuthenticationPolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
