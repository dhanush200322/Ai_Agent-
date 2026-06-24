import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export class ApiKeyEngine {
  /**
   * Generates a new API Key for an organization.
   * Format: eai_live_[16_char_prefix].[64_char_secret]
   */
  async generateKey(organizationId: string, name: string, scopes: string[], userId?: string) {
    const prefix = crypto.randomBytes(8).toString('hex');
    const secret = crypto.randomBytes(32).toString('hex');
    const rawKey = `eai_live_${prefix}.${secret}`;

    // Hash the secret part for storage
    const salt = await bcrypt.genSalt(10);
    const keyHash = await bcrypt.hash(secret, salt);

    // Save metadata and hash
    const apiKey = await (prisma as any).apiKey.create({
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
  async validateKey(rawKey: string): Promise<boolean> {
    if (!rawKey.startsWith('eai_live_')) return false;

    const [prefixSecret] = rawKey.split('eai_live_').slice(1);
    if (!prefixSecret.includes('.')) return false;

    const [prefix, secret] = prefixSecret.split('.');

    // Find candidate keys by prefix
    const candidate = await (prisma as any).apiKey.findFirst({
      where: { prefix, status: 'ACTIVE' },
      include: { permissions: true }
    });

    if (!candidate) return false;

    // Verify bcrypt hash
    const isValid = await bcrypt.compare(secret, candidate.keyHash);
    
    if (isValid) {
      // Async update last used
      (prisma as any).apiKey.update({
        where: { id: candidate.id },
        data: { lastUsedAt: new Date() }
      }).catch((e: any) => console.error(e));
    }

    return isValid;
  }
}
