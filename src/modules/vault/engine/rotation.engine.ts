import { prisma } from '../../../shared/prisma';
import { PrismaClient } from '@prisma/client';
import { QueueManager } from '../../queue/engine/queue-manager';
import { BullMQProvider } from '../../queue/providers/bullmq.provider';
import { VaultService } from '../services/vault.service';



export class RotationEngine {
  private queueManager: QueueManager;
  private vaultService: VaultService;

  constructor() {
    this.queueManager = new QueueManager(new BullMQProvider());
    this.vaultService = new VaultService();
  }

  async triggerRotation(secretId: string): Promise<void> {
    const policy = await prisma.secretRotationPolicy.findUnique({
      where: { secretId },
      include: { secret: true }
    });

    if (!policy) {
      throw new Error('No rotation policy found for this secret');
    }

    // Queue the rotation job for resilience and retries
    await this.queueManager.enqueue({
      queueName: 'vault.rotation',
      type: 'VAULT_ROTATION' as any,
      payload: {
        id: secretId,
        organizationId: policy.secret.organizationId,
        correlationId: secretId,
        traceId: secretId,
        priority: 'HIGH',
        retries: policy.autoRetry ? 3 : 0,
        payload: { secretId, strategy: policy.strategy, metadata: policy.metadata },
        metadata: {},
        createdAt: new Date()
      },
      priority: 'HIGH'
    });
  }

  async executeRotation(secretId: string, strategy: string, metadata?: string): Promise<void> {
    // This is called by the worker
    try {
      let newSecretValue = '';

      // Stub logic for rotating secrets based on strategy/provider
      if (strategy === 'PROVIDER_MANAGED') {
        const config = metadata ? JSON.parse(metadata) : {};
        if (config.provider === 'STRIPE') {
          newSecretValue = `sk_live_${Date.now()}_rotated`; // Call stripe.apiKeys.roll() in real implementation
        } else if (config.provider === 'OPENAI') {
          newSecretValue = `sk-proj-${Date.now()}_rotated`;
        } else {
          throw new Error(`Unsupported provider for rotation: ${config.provider}`);
        }
      } else {
        // Just generate a new random password for generic daily/weekly rotation
        newSecretValue = require('crypto').randomBytes(32).toString('base64');
      }

      await this.vaultService.rotateSecret(secretId, 'SYSTEM_ROTATION_ENGINE', newSecretValue);

      // Update policy dates
      await prisma.secretRotationPolicy.update({
        where: { secretId },
        data: {
          lastRotatedAt: new Date(),
          failureCount: 0,
          // If schedule is fixed, calculate nextRotationAt based on strategy
          nextRotationAt: strategy === 'DAILY' ? new Date(Date.now() + 86400000) : undefined
        }
      });
    } catch (err: any) {
      await prisma.secretRotationPolicy.update({
        where: { secretId },
        data: { failureCount: { increment: 1 } }
      });
      throw err;
    }
  }
}
