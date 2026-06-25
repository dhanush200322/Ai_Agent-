"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class OrganizationRepository {
    async findOrganizationById(id) {
        return prisma.organization.findUnique({
            where: { id }
        });
    }
    async updateOrganization(id, data) {
        return prisma.organization.update({
            where: { id },
            data
        });
    }
    async transferOwnership(_organizationId, currentOwnerId, newOwnerId) {
        return prisma.$transaction([
            prisma.user.update({ where: { id: currentOwnerId }, data: { isOwner: false } }),
            prisma.user.update({ where: { id: newOwnerId }, data: { isOwner: true } })
        ]);
    }
}
exports.OrganizationRepository = OrganizationRepository;
