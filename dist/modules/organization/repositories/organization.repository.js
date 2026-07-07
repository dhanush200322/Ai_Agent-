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
    async transferOwnership(organizationId, currentOwnerId, newOwnerId) {
        const newOwner = await prisma_1.prisma.user.findUnique({ where: { id: newOwnerId } });
        if (!newOwner || newOwner.organizationId !== organizationId) {
            throw new Error('New owner must belong to the same organization');
        }
        const currentOwner = await prisma_1.prisma.user.findUnique({ where: { id: currentOwnerId } });
        if (!currentOwner || currentOwner.organizationId !== organizationId) {
            throw new Error('Current owner must belong to the same organization');
        }
        return prisma_1.prisma.$transaction([
            prisma_1.prisma.user.update({ where: { id: currentOwnerId }, data: { isOwner: false } }),
            prisma_1.prisma.user.update({ where: { id: newOwnerId }, data: { isOwner: true } })
        ]);
    }
}
exports.OrganizationRepository = OrganizationRepository;
