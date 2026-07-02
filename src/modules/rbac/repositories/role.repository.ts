import { prisma } from '../../../shared/prisma';
import { PrismaClient } from '@prisma/client';



export class RoleRepository {
  async findRoleById(organizationId: string, id: string) {
    return prisma.role.findFirst({
      where: { id, organizationId },
      include: { permissions: true }
    });
  }

  async findRoleByName(organizationId: string, name: string) {
    return prisma.role.findFirst({
      where: { name, organizationId },
      include: { permissions: true }
    });
  }

  async getRoles(organizationId: string) {
    return prisma.role.findMany({
      where: { organizationId },
      include: { permissions: true }
    });
  }

  async createRole(organizationId: string, data: { name: string; description?: string }) {
    return prisma.role.create({
      data: {
        ...data,
        organizationId
      },
      include: { permissions: true }
    });
  }

  async updateRole(organizationId: string, id: string, data: { name?: string; description?: string }) {
    await prisma.role.updateMany({
      where: { id, organizationId },
      data
    });
    return this.findRoleById(organizationId, id);
  }
  
  async updateRoleStrict(id: string, data: { name?: string; description?: string }) {
    return prisma.role.update({
      where: { id },
      data,
      include: { permissions: true }
    });
  }

  async deleteRole(id: string) {
    return prisma.role.delete({
      where: { id }
    });
  }

  async assignPermission(roleId: string, permissionId: string) {
    return prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: { connect: { id: permissionId } }
      },
      include: { permissions: true }
    });
  }

  async removePermission(roleId: string, permissionId: string) {
    return prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: { disconnect: { id: permissionId } }
      },
      include: { permissions: true }
    });
  }

  async assignRoleToUser(userId: string, roleId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { roleId },
      include: { role: { include: { permissions: true } } }
    });
  }

  async getUserRole(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: { role: { include: { permissions: true } } }
    });
  }
}
