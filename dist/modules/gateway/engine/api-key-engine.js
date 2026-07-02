"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyEngine = void 0;
const prisma_1 = require("../../../shared/prisma");
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class ApiKeyEngine {
    /**
     * Generates a new API Key for an organization.
     * Format: eai_live_[16_char_prefix].[64_char_secret]
     */
    async generateKey(organizationId, name, scopes, userId) {
        const prefix = crypto_1.default.randomBytes(8).toString('hex');
        const secret = crypto_1.default.randomBytes(32).toString('hex');
        const rawKey = `eai_live_${prefix}.${secret}`;
        // Hash the secret part for storage
        const salt = await bcryptjs_1.default.genSalt(10);
        const keyHash = await bcryptjs_1.default.hash(secret, salt);
        // Save metadata and hash
        const apiKey = await prisma_1.prisma.apiKey.create({
            data: {
                organizationId,
                name,
                prefix,
                keyHash,
                createdById: userId,
                permissions: {
                    create: scopes.map(scope => ({ scope }))
                }
            }
        });
        return { rawKey, apiKey };
    }
    /**
     * Validates an incoming API Key header
     */
    async validateKey(rawKey) {
        if (!rawKey.startsWith('eai_live_'))
            return false;
        const [prefixSecret] = rawKey.split('eai_live_').slice(1);
        if (!prefixSecret.includes('.'))
            return false;
        const [prefix, secret] = prefixSecret.split('.');
        // Find candidate keys by prefix
        const candidate = await prisma_1.prisma.apiKey.findFirst({
            where: { prefix, status: 'ACTIVE' },
            include: { permissions: true }
        });
        if (!candidate)
            return false;
        // Verify bcrypt hash
        const isValid = await bcryptjs_1.default.compare(secret, candidate.keyHash);
        if (isValid) {
            // Async update last used
            prisma_1.prisma.apiKey.update({
                where: { id: candidate.id },
                data: { lastUsedAt: new Date() }
            }).catch((e) => console.error(e));
        }
        return isValid;
    }
}
exports.ApiKeyEngine = ApiKeyEngine;
