import { prisma } from '../../../shared/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class VersionEngine {
  private readonly logger = new Logger(VersionEngine.name);
  private readonly prisma = prisma;

  async negotiateVersion(requestedVersion: string) {
    this.logger.debug(`Negotiating API version: ${requestedVersion}`);
    const version = await this.prisma.apiVersion.findFirst({
      where: { version: requestedVersion }
    });

    if (!version) {
      throw new Error(`API Version ${requestedVersion} not found`);
    }

    if (version.status === 'RETIRED') {
      throw new Error(`API Version ${requestedVersion} is retired`);
    }

    return version;
  }
}
