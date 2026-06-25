"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const AppError_1 = require("../shared/errors/AppError");
const permissionCache_1 = require("../modules/rbac/utils/permissionCache");
const role_repository_1 = require("../modules/rbac/repositories/role.repository");
const roleRepo = new role_repository_1.RoleRepository();
const authorize = (requiredPermission) => {
    return async (req, _res, next) => {
        try {
            if (!req.user || !req.user.roleId) {
                throw new AppError_1.AuthorizationError('Authentication required');
            }
            const roleId = req.user.roleId;
            // 1. Check Cache
            let permissions = await permissionCache_1.PermissionCache.get(roleId);
            // 2. Cache Miss -> Load from DB
            if (!permissions) {
                const userRole = await roleRepo.getUserRole(req.user.id);
                if (!userRole || !userRole.role) {
                    throw new AppError_1.AuthorizationError('Role configuration error');
                }
                permissions = userRole.role.permissions.map(p => p.name);
                await permissionCache_1.PermissionCache.set(roleId, permissions);
            }
            // 3. Evaluate Permission
            if (!permissions.includes(requiredPermission)) {
                throw new AppError_1.AuthorizationError(`You do not have the required permission: ${requiredPermission}`);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.authorize = authorize;
