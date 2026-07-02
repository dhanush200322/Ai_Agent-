"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoordinationEngine = void 0;
const prisma_1 = require("../../../shared/prisma");
class CoordinationEngine {
    async delegateTask(sourceAgentId, targetAgentId, taskDefinition) {
        const delegation = await prisma_1.prisma.agentDelegation.create({
            data: {
                sourceAgentId,
                targetAgentId,
                taskDefinition,
                status: 'PENDING'
            }
        });
        await prisma_1.prisma.agentEvent.create({
            data: {
                agentId: sourceAgentId,
                type: 'DELEGATION',
                payload: JSON.stringify({ action: 'DELEGATE_OUT', delegationId: delegation.id, targetAgentId })
            }
        });
        return delegation.id;
    }
    async resolveDelegation(delegationId, status, result) {
        await prisma_1.prisma.agentDelegation.update({
            where: { id: delegationId },
            data: { status, result }
        });
    }
    async sendMessage(senderId, receiverId, content) {
        await prisma_1.prisma.agentMessage.create({
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
