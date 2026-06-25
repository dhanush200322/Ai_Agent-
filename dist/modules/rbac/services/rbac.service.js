"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RBACService = void 0;
const role_repository_1 = require("../repositories/role.repository");
const permission_repository_1 = require("../repositories/permission.repository");
const permissionCache_1 = require("../utils/permissionCache");
const auditLogger_1 = require("../../../shared/audit/auditLogger");
const AppError_1 = require("../../../shared/errors/AppError");
const roles_1 = require("../../../shared/constants/roles");
class RBACService {
    roleRepo = new role_repository_1.RoleRepository();
    permRepo = new permission_repository_1.PermissionRepository();
    PROTECTED_ROLES = [roles_1.DEFAULT_ROLES.OWNER, roles_1.DEFAULT_ROLES.ADMIN];
    async getRoles(organizationId) {
        return this.roleRepo.getRoles(organizationId);
    }
    async getPermissions() {
        return this.permRepo.getPermissions();
    }
    async createRole(organizationId, data) {
        const existing = await this.roleRepo.findRoleByName(organizationId, data.name);
        if (existing)
            throw new AppError_1.ConflictError('A role with this name already exists in your organization');
        const role = await this.roleRepo.createRole(organizationId, data);
        auditLogger_1.AuditLogger.log('ROLE_CREATED', 'role', { roleId: role.id, roleName: role.name });
        return role;
    }
    async updateRole(organizationId, roleId, data) {
        const role = await this.roleRepo.findRoleById(organizationId, roleId);
        if (!role)
            throw new AppError_1.NotFoundError('Role not found');
        if (this.PROTECTED_ROLES.includes(role.name) && data.name && data.name !== role.name) {
            throw new AppError_1.AuthorizationError('System roles cannot be renamed');
        }
        if (data.name && data.name !== role.name) {
            const existing = await this.roleRepo.findRoleByName(organizationId, data.name);
            if (existing)
                throw new AppError_1.ConflictError('A role with this name already exists');
        }
        const updated = await this.roleRepo.updateRoleStrict(roleId, data);
        await permissionCache_1.PermissionCache.invalidate(roleId);
        auditLogger_1.AuditLogger.log('ROLE_UPDATED', 'role', { roleId: role.id });
        return updated;
    }
    async deleteRole(organizationId, roleId) {
        const role = await this.roleRepo.findRoleById(organizationId, roleId);
        if (!role)
            throw new AppError_1.NotFoundError('Role not found');
        if (this.PROTECTED_ROLES.includes(role.name)) {
            throw new AppError_1.AuthorizationError('System roles cannot be deleted');
        }
        await this.roleRepo.deleteRole(roleId);
        await permissionCache_1.PermissionCache.invalidate(roleId);
        auditLogger_1.AuditLogger.log('ROLE_DELETED', 'role', { roleId: role.id });
        return { success: true };
    }
    async assignPermission(organizationId, roleId, permissionId) {
        const role = await this.roleRepo.findRoleById(organizationId, roleId);
        if (!role)
            throw new AppError_1.NotFoundError('Role not found');
        if (role.name === roles_1.DEFAULT_ROLES.OWNER) {
            throw new AppError_1.AuthorizationError('Owner role permissions cannot be modified');
        }
        const perm = await this.permRepo.findPermissionById(permissionId);
        if (!perm)
            throw new AppError_1.NotFoundError('Permission not found');
        const updated = await this.roleRepo.assignPermission(roleId, permissionId);
        await permissionCache_1.PermissionCache.invalidate(roleId);
        auditLogger_1.AuditLogger.log('PERMISSION_ASSIGNED', 'role', { roleId, permissionId });
        return updated;
    }
    async removePermission(organizationId, roleId, permissionId) {
        const role = await this.roleRepo.findRoleById(organizationId, roleId);
        if (!role)
            throw new AppError_1.NotFoundError('Role not found');
        if (role.name === roles_1.DEFAULT_ROLES.OWNER) {
            throw new AppError_1.AuthorizationError('Owner role permissions cannot be modified');
        }
        const updated = await this.roleRepo.removePermission(roleId, permissionId);
        await permissionCache_1.PermissionCache.invalidate(roleId);
        auditLogger_1.AuditLogger.log('PERMISSION_REMOVED', 'role', { roleId, permissionId });
        return updated;
    }
    async assignRoleToUser(requestingUserId, targetOrganizationId, targetUserId, targetRoleId) {
        // 1. Validate Target Role
        const role = await this.roleRepo.findRoleById(targetOrganizationId, targetRoleId);
        if (!role)
            throw new AppError_1.NotFoundError('Target role not found in your organization');
        // 2. Validate Target User
        const userRole = await this.roleRepo.getUserRole(targetUserId);
        if (!userRole || userRole.organizationId !== targetOrganizationId) {
            throw new AppError_1.NotFoundError('User not found in your organization');
        }
        // Security Rules
        if (userRole.id === requestingUserId) {
            throw new AppError_1.AuthorizationError('You cannot modify your own role');
        }
        if (role.name === roles_1.DEFAULT_ROLES.OWNER) {
            throw new AppError_1.AuthorizationError('You cannot assign the Owner role');
        }
        const updated = await this.roleRepo.assignRoleToUser(targetUserId, targetRoleId);
        await permissionCache_1.PermissionCache.invalidate(targetRoleId); // Invalidate cache for new role
        auditLogger_1.AuditLogger.log('ROLE_ASSIGNED', 'user', { targetUserId, assignedRoleId: targetRoleId });
        return updated;
    }
}
exports.RBACService = RBACService;
