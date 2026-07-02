import { prisma } from '../../../shared/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class OAuthEngine {
  private readonly logger = new Logger(OAuthEngine.name);
  private readonly prisma = prisma;

  async registerApplication(organizationId: string, name: string, redirectUris: string[]) {
    this.logger.debug(`Registering OAuth application ${name} for org ${organizationId}`);
    const clientId = crypto.randomBytes(16).toString('hex');
    const clientSecret = crypto.randomBytes(32).toString('hex');

    return this.prisma.developerOAuthApplication.create({
      data: {
        organizationId,
        name,
        clientId,
        clientSecret,
        redirectUris,
        scopes: ['read', 'write']
      }
    });
  }

  async validateClient(clientId: string, clientSecret: string) {
    const app = await this.prisma.developerOAuthApplication.findUnique({
      where: { clientId }
    });
    if (app && app.clientSecret === clientSecret && app.status === 'ACTIVE') {
      return app;
    }
    return null;
  }
}
