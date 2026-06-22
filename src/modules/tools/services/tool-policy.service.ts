import { AuthorizationError, AppError } from '../../../shared/errors/AppError';
import { PermissionCache } from '../../rbac/utils/permissionCache';
import { RoleRepository } from '../../rbac/repositories/role.repository';

const roleRepo = new RoleRepository();

export class ToolPolicyService {
  /**
   * Evaluates whether the current request is allowed to execute the specific tool.
   * Checks RBAC, constraints, and chain depth.
   */
  async evaluateToolPolicy(params: {
    userId: string;
    roleId: string;
    organizationId: string;
    toolName: string;
    chainDepth: number;
    maxChainDepth?: number;
  }) {
    const maxChain = params.maxChainDepth || 5;

    // 1. Check Chain Depth to prevent infinite loops
    if (params.chainDepth > maxChain) {
      throw new AppError(`Maximum tool execution chain depth (${maxChain}) reached.`, 429);
    }

    // 2. Check Role Permissions
    let permissions = await PermissionCache.get(params.roleId);
    if (!permissions) {
      const userRole = await roleRepo.getUserRole(params.userId);
      if (!userRole || !userRole.role) {
        throw new AuthorizationError('Role configuration error');
      }
      permissions = userRole.role.permissions.map(p => p.name);
      await PermissionCache.set(params.roleId, permissions);
    }

    // Agent execution inherently requires 'tool:execute' or specific tool permissions.
    // For simplicity, we assume 'tool:execute' allows general tool execution, 
    // or specific ones like 'knowledge:search'.
    const hasGlobalToolPermission = permissions.includes('tool:execute');
    const hasSpecificToolPermission = permissions.includes(`tool:${params.toolName}`);

    // If the tool is a system internal tool, we map it to existing permissions
    let requiredInternalPerm = '';
    if (params.toolName === 'knowledge.search') requiredInternalPerm = 'knowledge:view';
    if (params.toolName === 'memory.search') requiredInternalPerm = 'chat:read';

    const hasInternalPerm = requiredInternalPerm ? permissions.includes(requiredInternalPerm) : false;

    if (!hasGlobalToolPermission && !hasSpecificToolPermission && !hasInternalPerm) {
      throw new AuthorizationError(`You do not have permission to execute tool: ${params.toolName}`);
    }

    return true;
  }
}
