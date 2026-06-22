import { RoleRepository } from '../repositories/role.repository';
import { PermissionRepository } from '../repositories/permission.repository';
import { PermissionCache } from '../utils/permissionCache';
import { AuditLogger } from '../../../shared/audit/auditLogger';
import { ConflictError, NotFoundError, AuthorizationError } from '../../../shared/errors/AppError';
import { DEFAULT_ROLES } from '../../../shared/constants/roles';

export class RBACService {
  private roleRepo = new RoleRepository();
  private permRepo = new PermissionRepository();

  private PROTECTED_ROLES = [DEFAULT_ROLES.OWNER, DEFAULT_ROLES.ADMIN];

  async getRoles(organizationId: string) {
    return this.roleRepo.getRoles(organizationId);
  }

  async getPermissions() {
    return this.permRepo.getPermissions();
  }

  async createRole(organizationId: string, data: { name: string; description?: string }) {
    const existing = await this.roleRepo.findRoleByName(organizationId, data.name);
    if (existing) throw new ConflictError('A role with this name already exists in your organization');

    const role = await this.roleRepo.createRole(organizationId, data);
    AuditLogger.log('ROLE_CREATED', 'role', { roleId: role.id, roleName: role.name });
    return role;
  }

  async updateRole(organizationId: string, roleId: string, data: { name?: string; description?: string }) {
    const role = await this.roleRepo.findRoleById(organizationId, roleId);
    if (!role) throw new NotFoundError('Role not found');

    if (this.PROTECTED_ROLES.includes(role.name) && data.name && data.name !== role.name) {
      throw new AuthorizationError('System roles cannot be renamed');
    }

    if (data.name && data.name !== role.name) {
      const existing = await this.roleRepo.findRoleByName(organizationId, data.name);
      if (existing) throw new ConflictError('A role with this name already exists');
    }

    const updated = await this.roleRepo.updateRoleStrict(roleId, data);
    await PermissionCache.invalidate(roleId);
    AuditLogger.log('ROLE_UPDATED', 'role', { roleId: role.id });
    return updated;
  }

  async deleteRole(organizationId: string, roleId: string) {
    const role = await this.roleRepo.findRoleById(organizationId, roleId);
    if (!role) throw new NotFoundError('Role not found');

    if (this.PROTECTED_ROLES.includes(role.name)) {
      throw new AuthorizationError('System roles cannot be deleted');
    }

    await this.roleRepo.deleteRole(roleId);
    await PermissionCache.invalidate(roleId);
    AuditLogger.log('ROLE_DELETED', 'role', { roleId: role.id });
    return { success: true };
  }

  async assignPermission(organizationId: string, roleId: string, permissionId: string) {
    const role = await this.roleRepo.findRoleById(organizationId, roleId);
    if (!role) throw new NotFoundError('Role not found');

    if (role.name === DEFAULT_ROLES.OWNER) {
      throw new AuthorizationError('Owner role permissions cannot be modified');
    }

    const perm = await this.permRepo.findPermissionById(permissionId);
    if (!perm) throw new NotFoundError('Permission not found');

    const updated = await this.roleRepo.assignPermission(roleId, permissionId);
    await PermissionCache.invalidate(roleId);
    AuditLogger.log('PERMISSION_ASSIGNED', 'role', { roleId, permissionId });
    return updated;
  }

  async removePermission(organizationId: string, roleId: string, permissionId: string) {
    const role = await this.roleRepo.findRoleById(organizationId, roleId);
    if (!role) throw new NotFoundError('Role not found');

    if (role.name === DEFAULT_ROLES.OWNER) {
      throw new AuthorizationError('Owner role permissions cannot be modified');
    }

    const updated = await this.roleRepo.removePermission(roleId, permissionId);
    await PermissionCache.invalidate(roleId);
    AuditLogger.log('PERMISSION_REMOVED', 'role', { roleId, permissionId });
    return updated;
  }

  async assignRoleToUser(requestingUserId: string, targetOrganizationId: string, targetUserId: string, targetRoleId: string) {
    // 1. Validate Target Role
    const role = await this.roleRepo.findRoleById(targetOrganizationId, targetRoleId);
    if (!role) throw new NotFoundError('Target role not found in your organization');

    // 2. Validate Target User
    const userRole = await this.roleRepo.getUserRole(targetUserId);
    if (!userRole || userRole.organizationId !== targetOrganizationId) {
      throw new NotFoundError('User not found in your organization');
    }

    // Security Rules
    if (userRole.id === requestingUserId) {
      throw new AuthorizationError('You cannot modify your own role');
    }

    if (role.name === DEFAULT_ROLES.OWNER) {
      throw new AuthorizationError('You cannot assign the Owner role');
    }

    const updated = await this.roleRepo.assignRoleToUser(targetUserId, targetRoleId);
    await PermissionCache.invalidate(targetRoleId); // Invalidate cache for new role
    AuditLogger.log('ROLE_ASSIGNED', 'user', { targetUserId, assignedRoleId: targetRoleId });
    return updated;
  }
}
