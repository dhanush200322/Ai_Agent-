"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class UserRepository {
    async findUsers(organizationId, skip, take, search) {
        const whereClause = { organizationId, deletedAt: null };
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
    async findUserById(organizationId, id) {
        return prisma.user.findFirst({ where: { id, organizationId, deletedAt: null }, include: { role: true } });
    }
    async findDeletedUserById(organizationId, id) {
        return prisma.user.findFirst({ where: { id, organizationId, deletedAt: { not: null } } });
    }
    async updateUser(organizationId, id, data) {
        return prisma.user.updateMany({ where: { id, organizationId }, data }).then(() => this.findUserById(organizationId, id));
    }
    async softDeleteUser(organizationId, id) {
        return prisma.user.updateMany({ where: { id, organizationId }, data: { deletedAt: new Date() } });
    }
    async restoreUser(organizationId, id) {
        return prisma.user.updateMany({ where: { id, organizationId }, data: { deletedAt: null } });
    }
    async updateUserStatus(organizationId, id, status) {
        return prisma.user.updateMany({ where: { id, organizationId }, data: { status } });
    }
    async createUser(data) {
        return prisma.user.create({ data });
    }
}
exports.UserRepository = UserRepository;
