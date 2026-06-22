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

  async inviteUser(organizationId: string, inviterId: string, email: string, roleId: string) {
    const role = await this.roleRepo.findRoleById(organizationId, roleId);
    if (!role) throw new NotFoundError('Role not found');
    if (role.name === 'Owner') throw new AuthorizationError('Cannot invite users as Owner');

    const token = TokenHelper.generateRandomToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3);

    const invite = await this.inviteRepo.createInvitation({
      email,
      token,
      expiresAt,
      organizationId,
      roleId,
      inviterId
    });

    AuditLogger.log('USER_INVITED', 'user', { email, organizationId, roleId });
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
