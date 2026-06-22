import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
