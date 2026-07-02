import { prisma } from '../../../shared/prisma';
import { PrismaClient } from '@prisma/client';



export class InvitationRepository {
  async createInvitation(data: any) {
    return prisma.invitation.create({ data });
  }

  async findInvitationByToken(token: string) {
    return prisma.invitation.findUnique({ where: { token }, include: { role: true, organization: true } });
  }

  async updateInvitationStatus(id: string, status: 'ACCEPTED' | 'REVOKED' | 'EXPIRED') {
    return prisma.invitation.update({ where: { id }, data: { status } });
  }
}
