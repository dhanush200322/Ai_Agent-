import { prisma } from '../../../shared/prisma';
import { PrismaClient, NotificationChannel, NotificationPriority } from '@prisma/client';
import { CacheService } from '../../cache/cache.service';



export class NotificationPolicyEngine {
  private cache: CacheService;

  constructor() {
    this.cache = new CacheService();
  }

  async shouldSuppress(organizationId: string, recipient: string, body: string, suppressionWindowSec: number = 300): Promise<boolean> {
    const key = `notif_suppress:${organizationId}:${recipient}:${this.hash(body)}`;
    const cached = await this.cache.get<string>(key);
    if (cached) {
      return true;
    }
    await this.cache.set(key, '1', suppressionWindowSec);
    return false;
  }

  async checkFrequencyLimits(organizationId: string, userId?: string, limitPerHour: number = 100): Promise<boolean> {
    const key = userId 
      ? `notif_limit:user:${userId}`
      : `notif_limit:org:${organizationId}`;

    const countStr = await this.cache.get<string>(key);
    const count = countStr ? parseInt(countStr) : 0;

    if (count >= limitPerHour) {
      return false;
    }

    await this.cache.set(key, (count + 1).toString(), 3600);
    return true;
  }

  escalatePriority(currentPriority: NotificationPriority): NotificationPriority {
    if (currentPriority === 'LOW') return 'NORMAL';
    if (currentPriority === 'NORMAL') return 'HIGH';
    return 'CRITICAL';
  }

  isBusinessHours(timezone: string = 'UTC'): boolean {
    const now = new Date();
    const day = now.getUTCDay();
    const hour = now.getUTCHours();

    if (day === 0 || day === 6) return false;
    return hour >= 9 && hour < 17;
  }

  private hash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString();
  }
}
