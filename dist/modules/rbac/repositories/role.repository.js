"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class RoleRepository {
    async findRoleById(organizationId, id) {
        return prisma.role.findFirst({
            where: { id, organizationId },
            include: { permissions: true }
        });
    }
    async findRoleByName(organizationId, name) {
        return prisma.role.findFirst({
            where: { name, organizationId },
            include: { permissions: true }
        });
    }
    async getRoles(organizationId) {
        return prisma.role.findMany({
            where: { organizationId },
            include: { permissions: true }
        });
    }
    async createRole(organizationId, data) {
        return prisma.role.create({
            data: {
                ...data,
                organizationId
            },
            include: { permissions: true }
        });
    }
    async updateRole(organizationId, id, data) {
        await prisma.role.updateMany({
            where: { id, organizationId },
            data
        });
        return this.findRoleById(organizationId, id);
    }
    async updateRoleStrict(id, data) {
        return prisma.role.update({
            where: { id },
            data,
            include: { permissions: true }
        });
    }
    async deleteRole(id) {
        return prisma.role.delete({
            where: { id }
        });
    }
    async assignPermission(roleId, permissionId) {
        return prisma.role.update({
            where: { id: roleId },
            data: {
                permissions: { connect: { id: permissionId } }
            },
            include: { permissions: true }
        });
    }
    async removePermission(roleId, permissionId) {
        return prisma.role.update({
            where: { id: roleId },
            data: {
                permissions: { disconnect: { id: permissionId } }
            },
            include: { permissions: true }
        });
    }
    async assignRoleToUser(userId, roleId) {
        return prisma.user.update({
            where: { id: userId },
            data: { roleId },
            include: { role: { include: { permissions: true } } }
        });
    }
    async getUserRole(userId) {
        return prisma.user.findUnique({
            where: { id: userId },
            include: { role: { include: { permissions: true } } }
        });
    }
}
exports.RoleRepository = RoleRepository;
