import { prisma } from '../../../shared/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Request } from 'express';

@Injectable()
export class GatewayEngine {
  private readonly logger = new Logger(GatewayEngine.name);
  private readonly prisma = prisma;

  async resolveRoute(path: string, method: string) {
    this.logger.debug(`Resolving route for [${method}] ${path}`);
    return this.prisma.apiRoute.findFirst({
      where: {
        path: path,
        method: method
      }
    });
  }

  async processRequestPipeline(req: Request) {
    this.logger.debug(`Processing Gateway Request Pipeline for ${req.url}`);
    return {
      authenticated: true,
      rateLimited: false,
      transformed: false
    };
  }
}
