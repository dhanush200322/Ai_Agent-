"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaultService = void 0;
const client_1 = require("@prisma/client");
const database_vault_provider_1 = require("../providers/database-vault.provider");
const cache_service_1 = require("../../cache/cache.service");
const redis_constants_1 = require("../../../config/redis.constants");
const prisma = new client_1.PrismaClient();
class VaultService {
    provider;
    cache;
    constructor() {
        this.provider = new database_vault_provider_1.DatabaseVaultProvider();
        this.cache = new cache_service_1.CacheService();
    }
    async audit(secretId, actorId, actorType, action, metadata) {
        await prisma.vaultAccessLog.create({
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
    async retrieveSecret(secretId, actorId, actorType = 'USER') {
        const cacheKey = `${redis_constants_1.REDIS_CONSTANTS.NAMESPACES.VAULT}${secretId}`;
        let value = await this.cache.get(cacheKey);
        if (!value) {
            const result = await this.provider.retrieve(secretId);
            if (!result)
                return null;
            value = result.value;
            // Cache for a short time to reduce DB/Crypto load, e.g., 5 mins
            await this.cache.set(cacheKey, value, 300);
        }
        await this.audit(secretId, actorId, actorType, 'READ');
        return value;
    }
    async rotateSecret(secretId, actorId, newValue) {
        const newVersion = await this.provider.rotate(secretId, newValue);
        // Invalidate cache
        const cacheKey = `${redis_constants_1.REDIS_CONSTANTS.NAMESPACES.VAULT}${secretId}`;
        await this.cache.del(cacheKey);
        await this.audit(secretId, actorId, 'SYSTEM', 'ROTATE', { version: newVersion });
        return newVersion;
    }
    async revokeSecret(secretId, actorId) {
        // 1. Disable in database
        await this.provider.disable(secretId);
        // 2. Invalidate cache
        const cacheKey = `${redis_constants_1.REDIS_CONSTANTS.NAMESPACES.VAULT}${secretId}`;
        await this.cache.del(cacheKey);
        // 3. Revoke all active leases
        await prisma.secretLease.updateMany({
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
        const lease = await prisma.secretLease.create({
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
        const lease = await prisma.secretLease.findUnique({ where: { id: leaseId } });
        if (!lease || lease.isRevoked || new Date() > lease.expiresAt) {
            throw new Error('Lease is invalid, expired, or revoked');
        }
        return this.retrieveSecret(lease.secretId, lease.actorId, lease.actorType);
    }
}
exports.VaultService = VaultService;
