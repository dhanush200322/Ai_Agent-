"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseVaultProvider = void 0;
const prisma_1 = require("../../../shared/prisma");
const encryption_engine_1 = require("../engine/encryption.engine");
class DatabaseVaultProvider {
    encryptionEngine;
    constructor() {
        this.encryptionEngine = new encryption_engine_1.EncryptionEngine();
    }
    async store(organizationId, params) {
        const encryptedData = this.encryptionEngine.encrypt(params.value);
        const secret = await prisma_1.prisma.vaultSecret.create({
            data: {
                organizationId,
                name: params.name,
                description: params.description,
                category: params.category,
                provider: 'DATABASE',
                status: 'ACTIVE',
                versions: {
                    create: {
                        version: 1,
                        encryptedValue: encryptedData.encryptedValue,
                        iv: encryptedData.iv,
                        authTag: encryptedData.authTag,
                        keyVersion: encryptedData.keyVersion
                    }
                }
            }
        });
        return secret.id;
    }
    async retrieve(organizationId, secretId, version) {
        const secret = await prisma_1.prisma.vaultSecret.findUnique({
            where: { id: secretId, organizationId },
            include: {
                versions: {
                    orderBy: { version: 'desc' },
                    take: version ? undefined : 1,
                    where: version ? { version } : undefined
                }
            }
        });
        if (!secret || secret.status !== 'ACTIVE' || secret.versions.length === 0) {
            return null;
        }
        const targetVersion = secret.versions[0];
        try {
            const decrypted = this.encryptionEngine.decrypt({
                encryptedValue: targetVersion.encryptedValue,
                iv: targetVersion.iv,
                authTag: targetVersion.authTag,
                keyVersion: targetVersion.keyVersion
            });
            return {
                value: decrypted,
                version: targetVersion.version,
                category: secret.category,
                provider: secret.provider
            };
        }
        catch (err) {
            // Failed to decrypt or auth tag mismatch (tampered)
            throw new Error(`Decryption failed: ${err.message}`);
        }
    }
    async rotate(organizationId, secretId, newValue) {
        const secret = await prisma_1.prisma.vaultSecret.findUnique({
            where: { id: secretId, organizationId },
            include: {
                versions: {
                    orderBy: { version: 'desc' },
                    take: 1
                }
            }
        });
        if (!secret || secret.status !== 'ACTIVE') {
            throw new Error('Secret not found or not active');
        }
        const currentVersion = secret.versions.length > 0 ? secret.versions[0].version : 0;
        const newVersionNum = currentVersion + 1;
        const encryptedData = this.encryptionEngine.encrypt(newValue);
        await prisma_1.prisma.vaultSecretVersion.create({
            data: {
                secretId,
                version: newVersionNum,
                encryptedValue: encryptedData.encryptedValue,
                iv: encryptedData.iv,
                authTag: encryptedData.authTag,
                keyVersion: encryptedData.keyVersion
            }
        });
        return newVersionNum;
    }
    async disable(organizationId, secretId) {
        await prisma_1.prisma.vaultSecret.updateMany({
            where: { id: secretId, organizationId },
            data: { status: 'DISABLED' }
        });
    }
    async list(organizationId, category) {
        const whereClause = { organizationId, status: 'ACTIVE' };
        if (category) {
            whereClause.category = category;
        }
        return prisma_1.prisma.vaultSecret.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                description: true,
                category: true,
                provider: true,
                createdAt: true,
                updatedAt: true
            }
        });
    }
}
exports.DatabaseVaultProvider = DatabaseVaultProvider;
