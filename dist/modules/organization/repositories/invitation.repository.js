"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class InvitationRepository {
    async createInvitation(data) {
        return prisma.invitation.create({ data });
    }
    async findInvitationByToken(token) {
        return prisma.invitation.findUnique({ where: { token }, include: { role: true, organization: true } });
    }
    async updateInvitationStatus(id, status) {
        return prisma.invitation.update({ where: { id }, data: { status } });
    }
}
exports.InvitationRepository = InvitationRepository;
