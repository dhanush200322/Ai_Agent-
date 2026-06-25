"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoordinationEngine = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class CoordinationEngine {
    async delegateTask(sourceAgentId, targetAgentId, taskDefinition) {
        const delegation = await prisma.agentDelegation.create({
            data: {
                sourceAgentId,
                targetAgentId,
                taskDefinition,
                status: 'PENDING'
            }
        });
        await prisma.agentEvent.create({
            data: {
                agentId: sourceAgentId,
                type: 'DELEGATION',
                payload: JSON.stringify({ action: 'DELEGATE_OUT', delegationId: delegation.id, targetAgentId })
            }
        });
        return delegation.id;
    }
    async resolveDelegation(delegationId, status, result) {
        await prisma.agentDelegation.update({
            where: { id: delegationId },
            data: { status, result }
        });
    }
    async sendMessage(senderId, receiverId, content) {
        await prisma.agentMessage.create({
            data: {
                senderAgentId: senderId,
                receiverAgentId: receiverId,
                content,
                type: 'UPDATE'
            }
        });
    }
}
exports.CoordinationEngine = CoordinationEngine;
