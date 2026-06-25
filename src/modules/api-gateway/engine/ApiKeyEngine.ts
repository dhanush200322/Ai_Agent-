import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeyEngine {
  private readonly logger = new Logger(ApiKeyEngine.name);
  private prisma = new PrismaClient();

  async generateDeveloperKey(developerApplicationId: string, organizationId: string) {
    this.logger.debug(`Generating API Key for dev app ${developerApplicationId}`);
    const key = `ent_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');
    const prefix = key.substring(0, 8);

    const apiKey = await this.prisma.apiKey.create({
      data: {
        organizationId,
        developerApplicationId,
        type: 'EXTERNAL',
        ownerType: 'DEVELOPER',
        name: `Dev App Key - ${developerApplicationId}`,
        keyHash,
        prefix,
        status: 'ACTIVE',
        rateLimit: 1000,
        quota: 100000
      }
    });

    return { apiKey: key, keyId: apiKey.id };
  }

  async validateKey(key: string) {
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { keyHash }
    });
    if (!apiKey || apiKey.status !== 'ACTIVE') {
      return null;
    }
    await this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() }
    });
    return apiKey;
  }
}
