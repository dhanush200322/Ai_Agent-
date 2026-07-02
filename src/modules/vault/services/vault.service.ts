import { prisma } from '../../../shared/prisma';
import { PrismaClient } from '@prisma/client';
import { DatabaseVaultProvider } from '../providers/database-vault.provider';
import { VaultProvider } from '../providers/vault-provider.interface';
import { CacheService } from '../../cache/cache.service';
import { REDIS_CONSTANTS } from '../../../config/redis.constants';



export class VaultService {
  private provider: VaultProvider;
  private cache: CacheService;

  constructor() {
    this.provider = new DatabaseVaultProvider();
    this.cache = new CacheService();
  }

  private async audit(secretId: string, actorId: string, actorType: string, action: string, metadata?: any) {
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

  async storeSecret(organizationId: string, actorId: string, name: string, value: string, category: string, description?: string): Promise<string> {
    const secretId = await this.provider.store(organizationId, { name, description, category, value });
    await this.audit(secretId, actorId, 'USER', 'CREATE');
    return secretId;
  }

  async retrieveSecret(secretId: string, actorId: string, actorType: string = 'USER'): Promise<string | null> {
    const cacheKey = `${REDIS_CONSTANTS.NAMESPACES.VAULT}${secretId}`;
    
    let value = await this.cache.get<string>(cacheKey);

    if (!value) {
      const result = await this.provider.retrieve(secretId);
      if (!result) return null;
      value = result.value;
      // Cache for a short time to reduce DB/Crypto load, e.g., 5 mins
      await this.cache.set(cacheKey, value, 300);
    }

    await this.audit(secretId, actorId, actorType, 'READ');
    return value;
  }

  async rotateSecret(secretId: string, actorId: string, newValue: string): Promise<number> {
    const newVersion = await this.provider.rotate(secretId, newValue);
    
    // Invalidate cache
    const cacheKey = `${REDIS_CONSTANTS.NAMESPACES.VAULT}${secretId}`;
    await this.cache.del(cacheKey);

    await this.audit(secretId, actorId, 'SYSTEM', 'ROTATE', { version: newVersion });
    return newVersion;
  }

  async revokeSecret(secretId: string, actorId: string): Promise<void> {
    // 1. Disable in database
    await this.provider.disable(secretId);

    // 2. Invalidate cache
    const cacheKey = `${REDIS_CONSTANTS.NAMESPACES.VAULT}${secretId}`;
    await this.cache.del(cacheKey);

    // 3. Revoke all active leases
    await prisma.secretLease.updateMany({
      where: { secretId, isRevoked: false },
      data: { isRevoked: true }
    });

    await this.audit(secretId, actorId, 'USER', 'REVOKE');
  }

  async listSecrets(organizationId: string, category?: string): Promise<any[]> {
    return this.provider.list(organizationId, category);
  }

  async createLease(secretId: string, organizationId: string, actorId: string, actorType: string, ttlSeconds: number = 60): Promise<string> {
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

  async retrieveViaLease(leaseId: string): Promise<string | null> {
    const lease = await prisma.secretLease.findUnique({ where: { id: leaseId } });
    
    if (!lease || lease.isRevoked || new Date() > lease.expiresAt) {
      throw new Error('Lease is invalid, expired, or revoked');
    }

    return this.retrieveSecret(lease.secretId, lease.actorId, lease.actorType);
  }
}
