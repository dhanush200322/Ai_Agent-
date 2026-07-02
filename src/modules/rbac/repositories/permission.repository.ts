import { prisma } from '../../../shared/prisma';
import { PrismaClient } from '@prisma/client';



export class PermissionRepository {
  async getPermissions() {
    return prisma.permission.findMany();
  }

  async findPermissionByName(name: string) {
    return prisma.permission.findUnique({
      where: { name }
    });
  }
  
  async findPermissionById(id: string) {
    return prisma.permission.findUnique({
      where: { id }
    });
  }
}
