import logger from '../../../shared/logger/logger';

export class PermissionCache {
  private static cache = new Map<string, string[]>();

  static async get(roleId: string): Promise<string[] | null> {
    const permissions = this.cache.get(roleId);
    return permissions || null;
  }

  static async set(roleId: string, permissions: string[]): Promise<void> {
    this.cache.set(roleId, permissions);
  }

  static async invalidate(roleId: string): Promise<void> {
    this.cache.delete(roleId);
    logger.debug({ roleId }, 'Permission cache invalidated');
  }
}
