"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationService = void 0;
const client_1 = require("@prisma/client");
const AppError_1 = require("../../../shared/errors/AppError");
const prisma = new client_1.PrismaClient();
class ConversationService {
    /**
     * Create a new conversation
     */
    async createConversation(data) {
        return prisma.conversation.create({
            data: {
                sessionId: data.sessionId,
                organizationId: data.organizationId,
                agentId: data.agentId,
                userId: data.userId,
                status: 'ACTIVE'
            }
        });
    }
    /**
     * Get conversation by ID
     */
    async getConversationById(id, organizationId) {
        try {
            const conversation = await prisma.conversation.findFirst({
                where: {
                    id,
                    organizationId,
                    deletedAt: null
                },
                include: {
                    agent: {
                        select: { id: true, name: true, slug: true }
                    }
                }
            });
            if (!conversation) {
                throw new AppError_1.AppError('Conversation not found', 404);
            }
            return conversation;
        }
        catch (error) {
            throw new AppError_1.AppError('Conversation not found', 404);
        }
    }
    /**
     * List conversations with pagination
     */
    async listConversations(params) {
        const where = {
            organizationId: params.organizationId,
            deletedAt: null
        };
        if (params.userId)
            where.userId = params.userId;
        if (params.agentId)
            where.agentId = params.agentId;
        if (params.status)
            where.status = params.status;
        const [items, total] = await Promise.all([
            prisma.conversation.findMany({
                where,
                skip: params.skip,
                take: params.limit,
                orderBy: { updatedAt: 'desc' },
                include: {
                    agent: { select: { id: true, name: true } }
                }
            }),
            prisma.conversation.count({ where })
        ]);
        return { items, total };
    }
    /**
     * Archive conversation
     */
    async archiveConversation(id, organizationId) {
        const conversation = await this.getConversationById(id, organizationId);
        return prisma.conversation.update({
            where: { id: conversation.id },
            data: { status: 'ARCHIVED' }
        });
    }
    /**
     * Restore conversation
     */
    async restoreConversation(id, organizationId) {
        const conversation = await this.getConversationById(id, organizationId);
        return prisma.conversation.update({
            where: { id: conversation.id },
            data: { status: 'ACTIVE' }
        });
    }
    /**
     * Soft Delete conversation
     */
    async deleteConversation(id, organizationId) {
        const conversation = await this.getConversationById(id, organizationId);
        return prisma.conversation.update({
            where: { id: conversation.id },
            data: {
                status: 'DELETED',
                deletedAt: new Date()
            }
        });
    }
    /**
     * Update Conversation Title
     */
    async updateTitle(id, title) {
        return prisma.conversation.update({
            where: { id },
            data: { title }
        });
    }
    /**
     * Update Conversation Summary
     */
    async updateSummary(id, summary) {
        return prisma.conversation.update({
            where: { id },
            data: { summary }
        });
    }
    /**
     * Update lastMessageAt
     */
    async updateLastMessageAt(id) {
        return prisma.conversation.update({
            where: { id },
            data: { lastMessageAt: new Date() }
        });
    }
}
exports.ConversationService = ConversationService;
