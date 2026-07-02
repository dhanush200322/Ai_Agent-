"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeRepository = void 0;
const prisma_1 = require("../../../shared/prisma");
class KnowledgeRepository {
    async findKnowledgeBases(organizationId, skip, limit, search) {
        const where = {
            organizationId,
            deletedAt: null
        };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }
        const [items, total] = await Promise.all([
            prisma_1.prisma.knowledgeBase.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    createdBy: {
                        select: { id: true, firstName: true, lastName: true, avatar: true }
                    }
                }
            }),
            prisma_1.prisma.knowledgeBase.count({ where })
        ]);
        return { items, total };
    }
    async findKnowledgeBaseById(organizationId, id) {
        return prisma_1.prisma.knowledgeBase.findFirst({
            where: { id, organizationId, deletedAt: null },
            include: {
                createdBy: {
                    select: { id: true, firstName: true, lastName: true, avatar: true }
                }
            }
        });
    }
    async createKnowledgeBase(data) {
        return prisma_1.prisma.knowledgeBase.create({
            data
        });
    }
    async updateKnowledgeBase(_organizationId, id, data) {
        return prisma_1.prisma.knowledgeBase.update({
            where: { id },
            data
        });
    }
    async softDeleteKnowledgeBase(_organizationId, id) {
        return prisma_1.prisma.knowledgeBase.update({
            where: { id },
            data: {
                deletedAt: new Date()
            }
        });
    }
    // Document methods
    async createKnowledgeDocument(data) {
        return prisma_1.prisma.knowledgeDocument.create({
            data
        });
    }
    async findKnowledgeDocuments(organizationId, knowledgeBaseId) {
        return prisma_1.prisma.knowledgeDocument.findMany({
            where: {
                organizationId,
                knowledgeBaseId,
                deletedAt: null
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findKnowledgeDocumentById(organizationId, id) {
        return prisma_1.prisma.knowledgeDocument.findFirst({
            where: {
                id,
                organizationId,
                deletedAt: null
            }
        });
    }
    async softDeleteKnowledgeDocument(_organizationId, id) {
        return prisma_1.prisma.knowledgeDocument.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                status: 'DELETED'
            }
        });
    }
    // Agent Connection methods
    async getConnectedAgents(organizationId, knowledgeBaseId) {
        return prisma_1.prisma.agentKnowledgeBase.findMany({
            where: {
                knowledgeBaseId,
                agent: { organizationId, deletedAt: null }
            },
            include: {
                agent: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async addConnectedAgents(knowledgeBaseId, agentIds) {
        const data = agentIds.map(agentId => ({
            agentId,
            knowledgeBaseId
        }));
        return prisma_1.prisma.agentKnowledgeBase.createMany({
            data,
            skipDuplicates: true
        });
    }
    async removeConnectedAgent(knowledgeBaseId, agentId) {
        return prisma_1.prisma.agentKnowledgeBase.delete({
            where: {
                agentId_knowledgeBaseId: {
                    agentId,
                    knowledgeBaseId
                }
            }
        });
    }
}
exports.KnowledgeRepository = KnowledgeRepository;
