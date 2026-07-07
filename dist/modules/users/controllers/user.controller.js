"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const storage_service_1 = require("../../../shared/utils/storage.service");
const image_service_1 = require("../../../shared/utils/image.service");
const ApiResponse_1 = require("../../../shared/response/ApiResponse");
class UserController {
    userService = new user_service_1.UserService();
    getUsers = async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;
        const data = await this.userService.getUsers(req.user.organizationId, page, limit, search);
        res.status(200).json(ApiResponse_1.ApiResponse.success(data, 'Users fetched successfully', req.reqId));
    };
    getUser = async (req, res) => {
        const user = await this.userService.getUser(req.user.organizationId, req.params.id);
        res.status(200).json(ApiResponse_1.ApiResponse.success(user, 'User fetched successfully', req.reqId));
    };
    inviteUser = async (req, res) => {
        const { email, roleName } = req.body;
        const invite = await this.userService.inviteUser(req.user.organizationId, req.user.id, email, roleName);
        res.status(201).json(ApiResponse_1.ApiResponse.success(invite, 'Invitation sent', req.reqId));
    };
    acceptInvite = async (req, res) => {
        const { token, firstName, lastName, password } = req.body;
        const user = await this.userService.acceptInvite(token, { firstName, lastName, password });
        res.status(201).json(ApiResponse_1.ApiResponse.success(user, 'Invitation accepted', req.reqId));
    };
    updateStatus = async (req, res) => {
        await this.userService.updateUserStatus(req.user.organizationId, req.params.id, req.body.status);
        res.status(200).json(ApiResponse_1.ApiResponse.success(null, 'User status updated', req.reqId));
    };
    deleteUser = async (req, res) => {
        await this.userService.softDeleteUser(req.user.organizationId, req.params.id);
        res.status(200).json(ApiResponse_1.ApiResponse.success(null, 'User deleted', req.reqId));
    };
    updateProfile = async (req, res) => {
        let updateData = { ...req.body };
        if (req.file) {
            const baseName = await image_service_1.ImageService.processAvatar(req.file.path);
            updateData.avatar = storage_service_1.StorageService.getFileUrl(baseName);
            // Clean up old avatar if exists
            try {
                const existingUser = await this.userService.getUser(req.user.organizationId, req.user.id);
                if (existingUser && existingUser.avatar) {
                    await storage_service_1.StorageService.deleteFile(existingUser.avatar);
                }
            }
            catch (e) {
                console.error('Failed to cleanup old user avatar', e);
            }
        }
        const profile = await this.userService.updateProfile(req.user.organizationId, req.user.id, updateData);
        res.status(200).json(ApiResponse_1.ApiResponse.success(profile, 'Profile updated', req.reqId));
    };
}
exports.UserController = UserController;
