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
  
  async transferOwnership(organizationId: string, currentOwnerId: string, newOwnerId: string) {
    const newOwner = await prisma.user.findUnique({ where: { id: newOwnerId } });
    if (!newOwner || newOwner.organizationId !== organizationId) {
      throw new Error('New owner must belong to the same organization');
    }
    const currentOwner = await prisma.user.findUnique({ where: { id: currentOwnerId } });
    if (!currentOwner || currentOwner.organizationId !== organizationId) {
      throw new Error('Current owner must belong to the same organization');
    }
    return prisma.$transaction([
      prisma.user.update({ where: { id: currentOwnerId }, data: { isOwner: false } }),
      prisma.user.update({ where: { id: newOwnerId }, data: { isOwner: true } })
    ]);
  }
}
