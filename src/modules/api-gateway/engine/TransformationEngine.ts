import { prisma } from '../../../shared/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class TransformationEngine {
  private readonly logger = new Logger(TransformationEngine.name);
  private readonly prisma = prisma;

  async transformRequest(routeId: string, payload: any) {
    this.logger.debug(`Applying REQUEST transformations for route ${routeId}`);
    const transforms = await this.prisma.apiTransformation.findMany({
      where: { routeId, type: 'REQUEST' }
    });
    
    let transformed = { ...payload };
    for (const tx of transforms) {
      if ((tx.config as any)?.rename) {
        const { from, to } = (tx.config as any).rename;
        if (transformed[from]) {
          transformed[to] = transformed[from];
          delete transformed[from];
        }
      }
    }
    return transformed;
  }

  async transformResponse(routeId: string, payload: any) {
    this.logger.debug(`Applying RESPONSE transformations for route ${routeId}`);
    return payload;
  }
}
