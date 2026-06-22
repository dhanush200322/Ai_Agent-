import { Request, Response, NextFunction } from 'express';
import { AuthorizationError } from '../shared/errors/AppError';
import { PermissionCache } from '../modules/rbac/utils/permissionCache';
import { RoleRepository } from '../modules/rbac/repositories/role.repository';

const roleRepo = new RoleRepository();

export const authorize = (requiredPermission: string) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.roleId) {
        throw new AuthorizationError('Authentication required');
      }

      const roleId = req.user.roleId;

      // 1. Check Cache
      let permissions = await PermissionCache.get(roleId);

      // 2. Cache Miss -> Load from DB
      if (!permissions) {
        const userRole = await roleRepo.getUserRole(req.user.id);
        if (!userRole || !userRole.role) {
          throw new AuthorizationError('Role configuration error');
        }
        permissions = userRole.role.permissions.map(p => p.name);
        await PermissionCache.set(roleId, permissions);
      }

      // 3. Evaluate Permission
      if (!permissions.includes(requiredPermission)) {
        throw new AuthorizationError(`You do not have the required permission: ${requiredPermission}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
