import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { StorageService } from '../../../shared/utils/storage.service';
import { ImageService } from '../../../shared/utils/image.service';
import { ApiResponse } from '../../../shared/response/ApiResponse';

export class UserController {
  private userService = new UserService();

  getUsers = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    
    const data = await this.userService.getUsers(req.user!.organizationId, page, limit, search);
    res.status(200).json(ApiResponse.success(data, 'Users fetched successfully', req.reqId));
  };

  getUser = async (req: Request, res: Response) => {
    const user = await this.userService.getUser(req.user!.organizationId, req.params.id);
    res.status(200).json(ApiResponse.success(user, 'User fetched successfully', req.reqId));
  };

  inviteUser = async (req: Request, res: Response) => {
    const { email, roleName } = req.body;
    const invite = await this.userService.inviteUser(req.user!.organizationId, req.user!.id, email, roleName);
    res.status(201).json(ApiResponse.success(invite, 'Invitation sent', req.reqId));
  };

  acceptInvite = async (req: Request, res: Response) => {
    const { token, firstName, lastName, password } = req.body;
    const user = await this.userService.acceptInvite(token, { firstName, lastName, password });
    res.status(201).json(ApiResponse.success(user, 'Invitation accepted', req.reqId));
  };

  updateStatus = async (req: Request, res: Response) => {
    await this.userService.updateUserStatus(req.user!.organizationId, req.params.id, req.body.status);
    res.status(200).json(ApiResponse.success(null, 'User status updated', req.reqId));
  };

  deleteUser = async (req: Request, res: Response) => {
    await this.userService.softDeleteUser(req.user!.organizationId, req.params.id);
    res.status(200).json(ApiResponse.success(null, 'User deleted', req.reqId));
  };

  updateProfile = async (req: Request, res: Response) => {
    let updateData = { ...req.body };
    if (req.file) {
      const baseName = await ImageService.processAvatar(req.file.path);
      updateData.avatar = StorageService.getFileUrl(baseName);
      
      // Clean up old avatar if exists
      try {
        const existingUser = await this.userService.getUser(req.user!.organizationId, req.user!.id);
        if (existingUser && existingUser.avatar) {
          await StorageService.deleteFile(existingUser.avatar);
        }
      } catch (e) {
        console.error('Failed to cleanup old user avatar', e);
      }
    }
    const profile = await this.userService.updateProfile(req.user!.organizationId, req.user!.id, updateData);
    res.status(200).json(ApiResponse.success(profile, 'Profile updated', req.reqId));
  };
}
