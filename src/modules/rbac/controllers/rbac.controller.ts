import { Request, Response } from 'express';
import { RBACService } from '../services/rbac.service';
import { ApiResponse } from '../../../shared/response/ApiResponse';

export class RBACController {
  private rbacService = new RBACService();

  getRoles = async (req: Request, res: Response) => {
    const orgId = req.user!.organizationId;
    const roles = await this.rbacService.getRoles(orgId);
    res.status(200).json(ApiResponse.success(roles, 'Roles retrieved successfully', req.reqId));
  };

  createRole = async (req: Request, res: Response) => {
    const orgId = req.user!.organizationId;
    const role = await this.rbacService.createRole(orgId, req.body);
    res.status(201).json(ApiResponse.success(role, 'Role created successfully', req.reqId));
  };

  updateRole = async (req: Request, res: Response) => {
    const orgId = req.user!.organizationId;
    const roleId = req.params.id;
    const role = await this.rbacService.updateRole(orgId, roleId, req.body);
    res.status(200).json(ApiResponse.success(role, 'Role updated successfully', req.reqId));
  };

  deleteRole = async (req: Request, res: Response) => {
    const orgId = req.user!.organizationId;
    const roleId = req.params.id;
    await this.rbacService.deleteRole(orgId, roleId);
    res.status(200).json(ApiResponse.success(null, 'Role deleted successfully', req.reqId));
  };

  getPermissions = async (req: Request, res: Response) => {
    const perms = await this.rbacService.getPermissions();
    res.status(200).json(ApiResponse.success(perms, 'Permissions retrieved successfully', req.reqId));
  };

  assignPermission = async (req: Request, res: Response) => {
    const orgId = req.user!.organizationId;
    const roleId = req.params.id;
    const { permissionId } = req.body;
    const role = await this.rbacService.assignPermission(orgId, roleId, permissionId);
    res.status(200).json(ApiResponse.success(role, 'Permission assigned successfully', req.reqId));
  };
  
  removePermission = async (req: Request, res: Response) => {
    const orgId = req.user!.organizationId;
    const roleId = req.params.id;
    const permissionId = req.params.permissionId;
    const role = await this.rbacService.removePermission(orgId, roleId, permissionId);
    res.status(200).json(ApiResponse.success(role, 'Permission removed successfully', req.reqId));
  };

  assignUserRole = async (req: Request, res: Response) => {
    const orgId = req.user!.organizationId;
    const requestingUserId = req.user!.id;
    const targetUserId = req.params.id;
    const { roleId } = req.body;

    const user = await this.rbacService.assignRoleToUser(
      requestingUserId,
      orgId,
      targetUserId,
      roleId
    );
    res.status(200).json(ApiResponse.success(user, 'Role assigned to user successfully', req.reqId));
  };
}
