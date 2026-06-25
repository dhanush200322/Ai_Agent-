"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolPolicyService = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
const permissionCache_1 = require("../../rbac/utils/permissionCache");
const role_repository_1 = require("../../rbac/repositories/role.repository");
const roleRepo = new role_repository_1.RoleRepository();
class ToolPolicyService {
    /**
     * Evaluates whether the current request is allowed to execute the specific tool.
     * Checks RBAC, constraints, and chain depth.
     */
    async evaluateToolPolicy(params) {
        const maxChain = params.maxChainDepth || 5;
        // 1. Check Chain Depth to prevent infinite loops
        if (params.chainDepth > maxChain) {
            throw new AppError_1.AppError(`Maximum tool execution chain depth (${maxChain}) reached.`, 429);
        }
        // 2. Check Role Permissions
        let permissions = await permissionCache_1.PermissionCache.get(params.roleId);
        if (!permissions) {
            const userRole = await roleRepo.getUserRole(params.userId);
            if (!userRole || !userRole.role) {
                throw new AppError_1.AuthorizationError('Role configuration error');
            }
            permissions = userRole.role.permissions.map(p => p.name);
            await permissionCache_1.PermissionCache.set(params.roleId, permissions);
        }
        // Agent execution inherently requires 'tool:execute' or specific tool permissions.
        // For simplicity, we assume 'tool:execute' allows general tool execution, 
        // or specific ones like 'knowledge:search'.
        const hasGlobalToolPermission = permissions.includes('tool:execute');
        const hasSpecificToolPermission = permissions.includes(`tool:${params.toolName}`);
        // If the tool is a system internal tool, we map it to existing permissions
        let requiredInternalPerm = '';
        if (params.toolName === 'knowledge.search')
            requiredInternalPerm = 'knowledge:view';
        if (params.toolName === 'memory.search')
            requiredInternalPerm = 'chat:read';
        const hasInternalPerm = requiredInternalPerm ? permissions.includes(requiredInternalPerm) : false;
        if (!hasGlobalToolPermission && !hasSpecificToolPermission && !hasInternalPerm) {
            throw new AppError_1.AuthorizationError(`You do not have permission to execute tool: ${params.toolName}`);
        }
        return true;
    }
}
exports.ToolPolicyService = ToolPolicyService;
