"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_repository_1 = require("../repositories/user.repository");
const invitation_repository_1 = require("../../organization/repositories/invitation.repository");
const role_repository_1 = require("../../rbac/repositories/role.repository");
const password_1 = require("../../../shared/security/password");
const token_1 = require("../../../shared/security/token");
const auditLogger_1 = require("../../../shared/audit/auditLogger");
const AppError_1 = require("../../../shared/errors/AppError");
class UserService {
    userRepo = new user_repository_1.UserRepository();
    inviteRepo = new invitation_repository_1.InvitationRepository();
    roleRepo = new role_repository_1.RoleRepository();
    async getUsers(organizationId, page, limit, search) {
        const skip = (page - 1) * limit;
        const { items, total } = await this.userRepo.findUsers(organizationId, skip, limit, search);
        return {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
            items: items.map(u => { const { passwordHash, ...rest } = u; return rest; })
        };
    }
    async getUser(organizationId, id) {
        const user = await this.userRepo.findUserById(organizationId, id);
        if (!user)
            throw new AppError_1.NotFoundError('User not found');
        const { passwordHash, ...safeUser } = user;
        return safeUser;
    }
    async inviteUser(organizationId, inviterId, email, roleName) {
        const role = await this.roleRepo.findRoleByName(organizationId, roleName);
        if (!role)
            throw new AppError_1.NotFoundError(`Role '${roleName}' not found`);
        if (role.name === 'Owner')
            throw new AppError_1.AuthorizationError('Cannot invite users as Owner');
        const inviter = await this.userRepo.findUserById(organizationId, inviterId);
        if (!inviter)
            throw new AppError_1.NotFoundError('Inviter not found');
        const token = token_1.TokenHelper.generateRandomToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 3);
        const invite = await this.inviteRepo.createInvitation({
            email,
            token,
            expiresAt,
            organizationId,
            roleId: role.id,
            inviterId
        });
        try {
            const { Resend } = require('resend');
            if (process.env.RESEND_API_KEY) {
                const resend = new Resend(process.env.RESEND_API_KEY);
                await resend.emails.send({
                    from: inviter.email,
                    to: email,
                    subject: `You have been invited to join ${inviter.firstName}'s Organization`,
                    html: `<p>Click <a href="http://localhost:3001/accept-invite?token=${token}">here</a> to accept your invitation.</p>`
                });
            }
        }
        catch (e) {
            console.error('Failed to send invitation email via Resend', e);
        }
        auditLogger_1.AuditLogger.log('USER_INVITED', 'user', { email, organizationId, roleId: role.id });
        return invite;
    }
    async acceptInvite(token, data) {
        const invite = await this.inviteRepo.findInvitationByToken(token);
        if (!invite)
            throw new AppError_1.NotFoundError('Invalid invitation token');
        if (invite.status !== 'PENDING')
            throw new AppError_1.ConflictError('Invitation is no longer pending');
        if (new Date() > invite.expiresAt) {
            await this.inviteRepo.updateInvitationStatus(invite.id, 'EXPIRED');
            throw new AppError_1.ConflictError('Invitation has expired');
        }
        const passwordHash = await password_1.PasswordHelper.hash(data.password);
        const user = await this.userRepo.createUser({
            firstName: data.firstName,
            lastName: data.lastName,
            email: invite.email,
            passwordHash,
            organizationId: invite.organizationId,
            roleId: invite.roleId
        });
        await this.inviteRepo.updateInvitationStatus(invite.id, 'ACCEPTED');
        auditLogger_1.AuditLogger.log('USER_CREATED', 'user', { userId: user.id });
        const { passwordHash: _, ...safeUser } = user;
        return safeUser;
    }
    async updateUserStatus(organizationId, id, status) {
        const user = await this.userRepo.findUserById(organizationId, id);
        if (!user)
            throw new AppError_1.NotFoundError('User not found');
        if (user.isOwner)
            throw new AppError_1.AuthorizationError('Cannot modify Owner status');
        await this.userRepo.updateUserStatus(organizationId, id, status);
        auditLogger_1.AuditLogger.log('USER_UPDATED', 'user', { userId: id, status });
        return { success: true };
    }
    async softDeleteUser(organizationId, id) {
        const user = await this.userRepo.findUserById(organizationId, id);
        if (!user)
            throw new AppError_1.NotFoundError('User not found');
        if (user.isOwner)
            throw new AppError_1.AuthorizationError('Cannot delete Owner account');
        await this.userRepo.softDeleteUser(organizationId, id);
        auditLogger_1.AuditLogger.log('USER_DELETED', 'user', { userId: id });
        return { success: true };
    }
    async updateProfile(organizationId, userId, data) {
        const updated = await this.userRepo.updateUser(organizationId, userId, data);
        auditLogger_1.AuditLogger.log('PROFILE_UPDATED', 'user', { userId });
        return updated;
    }
}
exports.UserService = UserService;
