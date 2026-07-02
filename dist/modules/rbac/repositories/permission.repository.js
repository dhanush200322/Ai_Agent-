"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionRepository = void 0;
const prisma_1 = require("../../../shared/prisma");
class PermissionRepository {
    async getPermissions() {
        return prisma_1.prisma.permission.findMany();
    }
    async findPermissionByName(name) {
        return prisma_1.prisma.permission.findUnique({
            where: { name }
        });
    }
    async findPermissionById(id) {
        return prisma_1.prisma.permission.findUnique({
            where: { id }
        });
    }
}
exports.PermissionRepository = PermissionRepository;
