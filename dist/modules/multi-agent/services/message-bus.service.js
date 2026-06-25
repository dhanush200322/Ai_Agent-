"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageBusService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class MessageBusService {
    async send(senderAgentId, receiverAgentId, content, type = 'REQUEST', taskId, metadata) {
        return prisma.agentMessage.create({
            data: {
                senderAgentId,
                receiverAgentId,
                content,
                type,
                taskId,
                metadata: metadata ? JSON.stringify(metadata) : null
            }
        });
    }
    async broadcast(senderAgentId, teamId, content, type = 'UPDATE', taskId, metadata) {
        const team = await prisma.agentTeam.findUnique({ where: { id: teamId }, include: { members: true } });
        if (!team)
            throw new Error('Team not found');
        const messages = team.members
            .filter(m => m.agentId !== senderAgentId)
            .map(m => ({
            senderAgentId,
            receiverAgentId: m.agentId,
            content,
            type,
            taskId,
            metadata: metadata ? JSON.stringify(metadata) : null
        }));
        if (messages.length > 0) {
            await prisma.agentMessage.createMany({ data: messages });
        }
    }
    async getMessagesForAgent(agentId) {
        return prisma.agentMessage.findMany({
            where: { receiverAgentId: agentId },
            orderBy: { createdAt: 'asc' }
        });
    }
    async getTaskMessages(taskId) {
        return prisma.agentMessage.findMany({
            where: { taskId },
            orderBy: { createdAt: 'asc' }
        });
    }
}
exports.MessageBusService = MessageBusService;
