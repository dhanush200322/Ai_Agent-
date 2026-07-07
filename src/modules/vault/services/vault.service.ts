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

  async retrieveSecret(organizationId: string, secretId: string, actorId: string, actorType: string = 'USER'): Promise<string | null> {
    const cacheKey = `${REDIS_CONSTANTS.NAMESPACES.VAULT}${secretId}`;
    
    let value = await this.cache.get<string>(cacheKey);

    if (!value) {
      const result = await this.provider.retrieve(organizationId, secretId);
      if (!result) return null;
      value = result.value;
      // Cache for a short time to reduce DB/Crypto load, e.g., 5 mins
      await this.cache.set(cacheKey, value, 300);
    }

    await this.audit(secretId, actorId, actorType, 'READ');
    return value;
  }

  async rotateSecret(organizationId: string, secretId: string, actorId: string, newValue: string): Promise<number> {
    const newVersion = await this.provider.rotate(organizationId, secretId, newValue);
    
    // Invalidate cache
    const cacheKey = `${REDIS_CONSTANTS.NAMESPACES.VAULT}${secretId}`;
    await this.cache.del(cacheKey);

    await this.audit(secretId, actorId, 'SYSTEM', 'ROTATE', { version: newVersion });
    return newVersion;
  }

  async revokeSecret(organizationId: string, secretId: string, actorId: string): Promise<void> {
    // 1. Disable in database
    await this.provider.disable(organizationId, secretId);

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

    return this.retrieveSecret(lease.organizationId, lease.secretId, lease.actorId, lease.actorType);
  }

  async getStats(organizationId: string): Promise<any> {
    const totalSecrets = await prisma.vaultSecret.count({ where: { organizationId } });
    const activeSecrets = await prisma.vaultSecret.count({ where: { organizationId, status: 'ACTIVE' } });
    const disabledSecrets = await prisma.vaultSecret.count({ where: { organizationId, status: 'DISABLED' } });
    const expiringSoon = 0; // Not natively supported by current Prisma schema
    const expired = await prisma.vaultSecret.count({ where: { organizationId, status: 'DELETED' } });
    
    // Rotated recently (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const rotated = await prisma.vaultSecretVersion.count({
      where: {
        secret: { organizationId },
        version: { gt: 1 },
        createdAt: { gte: sevenDaysAgo }
      }
    });

    const accessCount = await prisma.vaultAccessLog.count({ where: { secret: { organizationId } } });
    
    const lastAccess = await prisma.vaultAccessLog.findFirst({
      where: { secret: { organizationId } },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    });

    const categories = await prisma.vaultSecret.groupBy({
      by: ['category'],
      where: { organizationId },
      _count: true
    });

    const providers = await prisma.vaultSecret.groupBy({
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
