import { prisma } from '../../../shared/prisma';
import { PrismaClient, UserStatus } from '@prisma/client';



export class UserRepository {
  async findUsers(organizationId: string, skip: number, take: number, search?: string) {
    const whereClause: any = { organizationId, deletedAt: null };
    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({ where: whereClause, skip, take, include: { role: true } }),
      prisma.user.count({ where: whereClause })
    ]);

    return { items, total };
  }

  async findUserById(organizationId: string, id: string) {
    return prisma.user.findFirst({ where: { id, organizationId, deletedAt: null }, include: { role: true } });
  }

  async findDeletedUserById(organizationId: string, id: string) {
    return prisma.user.findFirst({ where: { id, organizationId, deletedAt: { not: null } } });
  }

  async updateUser(organizationId: string, id: string, data: any) {
    return prisma.user.updateMany({ where: { id, organizationId }, data }).then(() => this.findUserById(organizationId, id));
  }

  async softDeleteUser(organizationId: string, id: string) {
    return prisma.user.updateMany({ where: { id, organizationId }, data: { deletedAt: new Date() } });
  }

  async restoreUser(organizationId: string, id: string) {
    return prisma.user.updateMany({ where: { id, organizationId }, data: { deletedAt: null } });
  }
  
  async updateUserStatus(organizationId: string, id: string, status: UserStatus) {
    return prisma.user.updateMany({ where: { id, organizationId }, data: { status } });
  }

  async createUser(data: any) {
    return prisma.user.create({ data });
  }
}
