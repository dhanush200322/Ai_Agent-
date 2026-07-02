"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationRepository = void 0;
const prisma_1 = require("../../../shared/prisma");
class InvitationRepository {
    async createInvitation(data) {
        return prisma_1.prisma.invitation.create({ data });
    }
    async findInvitationByToken(token) {
        return prisma_1.prisma.invitation.findUnique({ where: { token }, include: { role: true, organization: true } });
    }
    async updateInvitationStatus(id, status) {
        return prisma_1.prisma.invitation.update({ where: { id }, data: { status } });
    }
}
exports.InvitationRepository = InvitationRepository;
