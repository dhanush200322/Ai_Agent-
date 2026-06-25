"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class PermissionRepository {
    async getPermissions() {
        return prisma.permission.findMany();
    }
    async findPermissionByName(name) {
        return prisma.permission.findUnique({
            where: { name }
        });
    }
    async findPermissionById(id) {
        return prisma.permission.findUnique({
            where: { id }
        });
    }
}
exports.PermissionRepository = PermissionRepository;
