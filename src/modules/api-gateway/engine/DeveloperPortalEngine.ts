import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DeveloperPortalEngine {
  private readonly logger = new Logger(DeveloperPortalEngine.name);
  private prisma = new PrismaClient();

  async registerDeveloper(userId: string) {
    this.logger.debug(`Registering developer for user ${userId}`);
    return this.prisma.developer.create({
      data: { userId, status: 'ACTIVE' }
    });
  }

  async getDeveloperDashboard(developerId: string) {
    const apps = await this.prisma.developerApplication.findMany(); // would filter by dev
    const analytics = await this.prisma.apiAnalytics.findMany();
    return { apps, analytics };
  }
}
