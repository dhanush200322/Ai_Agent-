import { UserRepository } from '../repositories/user.repository';
import { InvitationRepository } from '../../organization/repositories/invitation.repository';
import { RoleRepository } from '../../rbac/repositories/role.repository';
import { PasswordHelper } from '../../../shared/security/password';
import { TokenHelper } from '../../../shared/security/token';
import { AuditLogger } from '../../../shared/audit/auditLogger';
import { ConflictError, NotFoundError, AuthorizationError } from '../../../shared/errors/AppError';

export class UserService {
  private userRepo = new UserRepository();
  private inviteRepo = new InvitationRepository();
  private roleRepo = new RoleRepository();

  async getUsers(organizationId: string, page: number, limit: number, search?: string) {
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

  async getUser(organizationId: string, id: string) {
    const user = await this.userRepo.findUserById(organizationId, id);
    if (!user) throw new NotFoundError('User not found');
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async inviteUser(organizationId: string, inviterId: string, email: string, roleName: string) {
    const role = await this.roleRepo.findRoleByName(organizationId, roleName);
    if (!role) throw new NotFoundError(`Role '${roleName}' not found`);
    if (role.name === 'Owner') throw new AuthorizationError('Cannot invite users as Owner');

    const inviter = await this.userRepo.findUserById(organizationId, inviterId);
    if (!inviter) throw new NotFoundError('Inviter not found');

    const token = TokenHelper.generateRandomToken();
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
      const { ResendProvider } = require('../../notifications/services/resend.provider');
      const resendProvider = new ResendProvider();
      
      const subject = `You have been invited to join ${inviter.firstName}'s Workspace on Nexora AI`;
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #111;">Join ${inviter.firstName} ${inviter.lastName} on Nexora AI</h2>
          <p>Hello,</p>
          <p><strong>${inviter.email}</strong> has invited you to join their workspace as a <strong>${role.name}</strong>.</p>
          <p>Click the button below to accept the invitation and set up your account:</p>
          <div style="margin: 30px 0;">
            <a href="http://localhost:3001/accept-invite?token=${token}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Accept Invitation</a>
          </div>
          <p style="color: #666; font-size: 14px;">If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      `;

      await resendProvider.sendEmail(email, subject, html, undefined, inviter.email);
    } catch (e) {
      console.error('Failed to send invitation email via ResendProvider', e);
    }

    AuditLogger.log('USER_INVITED', 'user', { email, organizationId, roleId: role.id });
    return invite;
  }

  async acceptInvite(token: string, data: any) {
    const invite = await this.inviteRepo.findInvitationByToken(token);
    if (!invite) throw new NotFoundError('Invalid invitation token');
    if (invite.status !== 'PENDING') throw new ConflictError('Invitation is no longer pending');
    if (new Date() > invite.expiresAt) {
      await this.inviteRepo.updateInvitationStatus(invite.id, 'EXPIRED');
      throw new ConflictError('Invitation has expired');
    }

    const passwordHash = await PasswordHelper.hash(data.password);

    const user = await this.userRepo.createUser({
      firstName: data.firstName,
      lastName: data.lastName,
      email: invite.email,
      passwordHash,
      organizationId: invite.organizationId,
      roleId: invite.roleId
    });

    await this.inviteRepo.updateInvitationStatus(invite.id, 'ACCEPTED');
    AuditLogger.log('USER_CREATED', 'user', { userId: user.id });
    
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  async updateUserStatus(organizationId: string, id: string, status: any) {
    const user = await this.userRepo.findUserById(organizationId, id);
    if (!user) throw new NotFoundError('User not found');
    if (user.isOwner) throw new AuthorizationError('Cannot modify Owner status');

    await this.userRepo.updateUserStatus(organizationId, id, status);
    AuditLogger.log('USER_UPDATED', 'user', { userId: id, status });
    return { success: true };
  }

  async softDeleteUser(organizationId: string, id: string) {
    const user = await this.userRepo.findUserById(organizationId, id);
    if (!user) throw new NotFoundError('User not found');
    if (user.isOwner) throw new AuthorizationError('Cannot delete Owner account');

    await this.userRepo.softDeleteUser(organizationId, id);
    AuditLogger.log('USER_DELETED', 'user', { userId: id });
    return { success: true };
  }

  async updateProfile(organizationId: string, userId: string, data: any) {
    const updated = await this.userRepo.updateUser(organizationId, userId, data);
    AuditLogger.log('PROFILE_UPDATED', 'user', { userId });
    return updated;
  }
}
