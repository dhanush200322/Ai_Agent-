"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationRepository = void 0;
const prisma_1 = require("../../../shared/prisma");
class OrganizationRepository {
    async findOrganizationById(id) {
        return prisma_1.prisma.organization.findUnique({
            where: { id }
        });
    }
    async updateOrganization(id, data) {
        return prisma_1.prisma.organization.update({
            where: { id },
            data
        });
    }
    async transferOwnership(_organizationId, currentOwnerId, newOwnerId) {
        return prisma_1.prisma.$transaction([
            prisma_1.prisma.user.update({ where: { id: currentOwnerId }, data: { isOwner: false } }),
            prisma_1.prisma.user.update({ where: { id: newOwnerId }, data: { isOwner: true } })
        ]);
    }
}
exports.OrganizationRepository = OrganizationRepository;
