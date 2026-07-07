"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaultService = void 0;
const prisma_1 = require("../../../shared/prisma");
const database_vault_provider_1 = require("../providers/database-vault.provider");
const cache_service_1 = require("../../cache/cache.service");
const redis_constants_1 = require("../../../config/redis.constants");
class VaultService {
    provider;
    cache;
    constructor() {
        this.provider = new database_vault_provider_1.DatabaseVaultProvider();
        this.cache = new cache_service_1.CacheService();
    }
    async audit(secretId, actorId, actorType, action, metadata) {
        await prisma_1.prisma.vaultAccessLog.create({
            data: {
                secretId,
                actorId,
                actorType,
                action,
                metadata: metadata ? JSON.stringify(metadata) : null
            }
        });
    }
    async storeSecret(organizationId, actorId, name, value, category, description) {
        const secretId = await this.provider.store(organizationId, { name, description, category, value });
        await this.audit(secretId, actorId, 'USER', 'CREATE');
        return secretId;
    }
    async retrieveSecret(organizationId, secretId, actorId, actorType = 'USER') {
        const cacheKey = `${redis_constants_1.REDIS_CONSTANTS.NAMESPACES.VAULT}${secretId}`;
        let value = await this.cache.get(cacheKey);
        if (!value) {
            const result = await this.provider.retrieve(organizationId, secretId);
            if (!result)
                return null;
            value = result.value;
            // Cache for a short time to reduce DB/Crypto load, e.g., 5 mins
            await this.cache.set(cacheKey, value, 300);
        }
        await this.audit(secretId, actorId, actorType, 'READ');
        return value;
    }
    async rotateSecret(organizationId, secretId, actorId, newValue) {
        const newVersion = await this.provider.rotate(organizationId, secretId, newValue);
        // Invalidate cache
        const cacheKey = `${redis_constants_1.REDIS_CONSTANTS.NAMESPACES.VAULT}${secretId}`;
        await this.cache.del(cacheKey);
        await this.audit(secretId, actorId, 'SYSTEM', 'ROTATE', { version: newVersion });
        return newVersion;
    }
    async revokeSecret(organizationId, secretId, actorId) {
        // 1. Disable in database
        await this.provider.disable(organizationId, secretId);
        // 2. Invalidate cache
        const cacheKey = `${redis_constants_1.REDIS_CONSTANTS.NAMESPACES.VAULT}${secretId}`;
        await this.cache.del(cacheKey);
        // 3. Revoke all active leases
        await prisma_1.prisma.secretLease.updateMany({
            where: { secretId, isRevoked: false },
            data: { isRevoked: true }
        });
        await this.audit(secretId, actorId, 'USER', 'REVOKE');
    }
    async listSecrets(organizationId, category) {
        return this.provider.list(organizationId, category);
    }
    async createLease(secretId, organizationId, actorId, actorType, ttlSeconds = 60) {
        const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
        const lease = await prisma_1.prisma.secretLease.create({
            data: {
                organizationId,
                secretId,
                actorId,
                actorType,
                expiresAt
            }
        });
        await this.audit(secretId, actorId, actorType, 'LEASE_CREATED', { leaseId: lease.id, expiresAt });
        return lease.id;
    }
    async retrieveViaLease(leaseId) {
        const lease = await prisma_1.prisma.secretLease.findUnique({ where: { id: leaseId } });
        if (!lease || lease.isRevoked || new Date() > lease.expiresAt) {
            throw new Error('Lease is invalid, expired, or revoked');
        }
        return this.retrieveSecret(lease.organizationId, lease.secretId, lease.actorId, lease.actorType);
    }
    async getStats(organizationId) {
        const totalSecrets = await prisma_1.prisma.vaultSecret.count({ where: { organizationId } });
        const activeSecrets = await prisma_1.prisma.vaultSecret.count({ where: { organizationId, status: 'ACTIVE' } });
        const disabledSecrets = await prisma_1.prisma.vaultSecret.count({ where: { organizationId, status: 'DISABLED' } });
        const expiringSoon = 0; // Not natively supported by current Prisma schema
        const expired = await prisma_1.prisma.vaultSecret.count({ where: { organizationId, status: 'DELETED' } });
        // Rotated recently (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const rotated = await prisma_1.prisma.vaultSecretVersion.count({
            where: {
                secret: { organizationId },
                version: { gt: 1 },
                createdAt: { gte: sevenDaysAgo }
            }
        });
        const accessCount = await prisma_1.prisma.vaultAccessLog.count({ where: { secret: { organizationId } } });
        const lastAccess = await prisma_1.prisma.vaultAccessLog.findFirst({
            where: { secret: { organizationId } },
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true }
        });
        const categories = await prisma_1.prisma.vaultSecret.groupBy({
            by: ['category'],
            where: { organizationId },
            _count: true
        });
        const providers = await prisma_1.prisma.vaultSecret.groupBy({
            by: ['provider'],
            where: { organizationId },
            _count: true
        });
        return {
            totalSecrets,
            activeSecrets,
            disabledSecrets,
            expiringSoon,
            expired,
            rotated,
            accessCount,
            lastAccessTime: lastAccess?.createdAt || null,
            categories: categories.length,
            providers: providers.length
        };
    }
}
exports.VaultService = VaultService;
