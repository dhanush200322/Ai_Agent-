"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleRepository = void 0;
const prisma_1 = require("../../../shared/prisma");
class RoleRepository {
    async findRoleById(organizationId, id) {
        return prisma_1.prisma.role.findFirst({
            where: { id, organizationId },
            include: { permissions: true }
        });
    }
    async findRoleByName(organizationId, name) {
        return prisma_1.prisma.role.findFirst({
            where: { name, organizationId },
            include: { permissions: true }
        });
    }
    async getRoles(organizationId) {
        return prisma_1.prisma.role.findMany({
            where: { organizationId },
            include: { permissions: true }
        });
    }
    async createRole(organizationId, data) {
        return prisma_1.prisma.role.create({
            data: {
                ...data,
                organizationId
            },
            include: { permissions: true }
        });
    }
    async updateRole(organizationId, id, data) {
        await prisma_1.prisma.role.updateMany({
            where: { id, organizationId },
            data
        });
        return this.findRoleById(organizationId, id);
    }
    async updateRoleStrict(id, data) {
        return prisma_1.prisma.role.update({
            where: { id },
            data,
            include: { permissions: true }
        });
    }
    async deleteRole(id) {
        return prisma_1.prisma.role.delete({
            where: { id }
        });
    }
    async assignPermission(roleId, permissionId) {
        return prisma_1.prisma.role.update({
            where: { id: roleId },
            data: {
                permissions: { connect: { id: permissionId } }
            },
            include: { permissions: true }
        });
    }
    async removePermission(roleId, permissionId) {
        return prisma_1.prisma.role.update({
            where: { id: roleId },
            data: {
                permissions: { disconnect: { id: permissionId } }
            },
            include: { permissions: true }
        });
    }
    async assignRoleToUser(userId, roleId) {
        return prisma_1.prisma.user.update({
            where: { id: userId },
            data: { roleId },
            include: { role: { include: { permissions: true } } }
        });
    }
    async getUserRole(userId) {
        return prisma_1.prisma.user.findUnique({
            where: { id: userId },
            include: { role: { include: { permissions: true } } }
        });
    }
}
exports.RoleRepository = RoleRepository;
