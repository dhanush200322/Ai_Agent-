import { prisma } from '../../../shared/prisma';
import { PrismaClient } from '@prisma/client';



export class OrganizationRepository {
  async findOrganizationById(id: string) {
    return prisma.organization.findUnique({
      where: { id }
    });
  }

  async updateOrganization(id: string, data: any) {
    return prisma.organization.update({
      where: { id },
      data
    });
  }
  
  async transferOwnership(_organizationId: string, currentOwnerId: string, newOwnerId: string) {
    return prisma.$transaction([
      prisma.user.update({ where: { id: currentOwnerId }, data: { isOwner: false } }),
      prisma.user.update({ where: { id: newOwnerId }, data: { isOwner: true } })
    ]);
  }
}
