"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotationEngine = void 0;
const prisma_1 = require("../../../shared/prisma");
const queue_manager_1 = require("../../queue/engine/queue-manager");
const bullmq_provider_1 = require("../../queue/providers/bullmq.provider");
const vault_service_1 = require("../services/vault.service");
class RotationEngine {
    queueManager;
    vaultService;
    constructor() {
        this.queueManager = new queue_manager_1.QueueManager(new bullmq_provider_1.BullMQProvider());
        this.vaultService = new vault_service_1.VaultService();
    }
    async triggerRotation(secretId) {
        const policy = await prisma_1.prisma.secretRotationPolicy.findUnique({
            where: { secretId },
            include: { secret: true }
        });
        if (!policy) {
            throw new Error('No rotation policy found for this secret');
        }
        // Queue the rotation job for resilience and retries
        await this.queueManager.enqueue({
            queueName: 'vault.rotation',
            type: 'VAULT_ROTATION',
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
    async executeRotation(organizationId, secretId, strategy, metadata) {
        // This is called by the worker
        try {
            let newSecretValue = '';
            // Stub logic for rotating secrets based on strategy/provider
            if (strategy === 'PROVIDER_MANAGED') {
                const config = metadata ? JSON.parse(metadata) : {};
                if (config.provider === 'STRIPE') {
                    newSecretValue = `sk_live_${Date.now()}_rotated`; // Call stripe.apiKeys.roll() in real implementation
                }
                else if (config.provider === 'OPENAI') {
                    newSecretValue = `sk-proj-${Date.now()}_rotated`;
                }
                else {
                    throw new Error(`Unsupported provider for rotation: ${config.provider}`);
                }
            }
            else {
                // Just generate a new random password for generic daily/weekly rotation
                newSecretValue = require('crypto').randomBytes(32).toString('base64');
            }
            await this.vaultService.rotateSecret(organizationId, secretId, 'SYSTEM_ROTATION_ENGINE', newSecretValue);
            // Update policy dates
            await prisma_1.prisma.secretRotationPolicy.update({
                where: { secretId },
                data: {
                    lastRotatedAt: new Date(),
                    failureCount: 0,
                    // If schedule is fixed, calculate nextRotationAt based on strategy
                    nextRotationAt: strategy === 'DAILY' ? new Date(Date.now() + 86400000) : undefined
                }
            });
        }
        catch (err) {
            await prisma_1.prisma.secretRotationPolicy.update({
                where: { secretId },
                data: { failureCount: { increment: 1 } }
            });
            throw err;
        }
    }
}
exports.RotationEngine = RotationEngine;
