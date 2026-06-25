"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RBACController = void 0;
const rbac_service_1 = require("../services/rbac.service");
const ApiResponse_1 = require("../../../shared/response/ApiResponse");
class RBACController {
    rbacService = new rbac_service_1.RBACService();
    getRoles = async (req, res) => {
        const orgId = req.user.organizationId;
        const roles = await this.rbacService.getRoles(orgId);
        res.status(200).json(ApiResponse_1.ApiResponse.success(roles, 'Roles retrieved successfully', req.reqId));
    };
    createRole = async (req, res) => {
        const orgId = req.user.organizationId;
        const role = await this.rbacService.createRole(orgId, req.body);
        res.status(201).json(ApiResponse_1.ApiResponse.success(role, 'Role created successfully', req.reqId));
    };
    updateRole = async (req, res) => {
        const orgId = req.user.organizationId;
        const roleId = req.params.id;
        const role = await this.rbacService.updateRole(orgId, roleId, req.body);
        res.status(200).json(ApiResponse_1.ApiResponse.success(role, 'Role updated successfully', req.reqId));
    };
    deleteRole = async (req, res) => {
        const orgId = req.user.organizationId;
        const roleId = req.params.id;
        await this.rbacService.deleteRole(orgId, roleId);
        res.status(200).json(ApiResponse_1.ApiResponse.success(null, 'Role deleted successfully', req.reqId));
    };
    getPermissions = async (req, res) => {
        const perms = await this.rbacService.getPermissions();
        res.status(200).json(ApiResponse_1.ApiResponse.success(perms, 'Permissions retrieved successfully', req.reqId));
    };
    assignPermission = async (req, res) => {
        const orgId = req.user.organizationId;
        const roleId = req.params.id;
        const { permissionId } = req.body;
        const role = await this.rbacService.assignPermission(orgId, roleId, permissionId);
        res.status(200).json(ApiResponse_1.ApiResponse.success(role, 'Permission assigned successfully', req.reqId));
    };
    removePermission = async (req, res) => {
        const orgId = req.user.organizationId;
        const roleId = req.params.id;
        const permissionId = req.params.permissionId;
        const role = await this.rbacService.removePermission(orgId, roleId, permissionId);
        res.status(200).json(ApiResponse_1.ApiResponse.success(role, 'Permission removed successfully', req.reqId));
    };
    assignUserRole = async (req, res) => {
        const orgId = req.user.organizationId;
        const requestingUserId = req.user.id;
        const targetUserId = req.params.id;
        const { roleId } = req.body;
        const user = await this.rbacService.assignRoleToUser(requestingUserId, orgId, targetUserId, roleId);
        res.status(200).json(ApiResponse_1.ApiResponse.success(user, 'Role assigned to user successfully', req.reqId));
    };
}
exports.RBACController = RBACController;
