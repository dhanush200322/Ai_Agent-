"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRepository = void 0;
const prisma_1 = require("../../../shared/prisma");
class AgentRepository {
    async findAgents(organizationId, skip, limit, search) {
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
            prisma_1.prisma.agent.findMany({
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
            prisma_1.prisma.agent.count({ where })
        ]);
        return { items, total };
    }
    async findAgentById(organizationId, id) {
        return prisma_1.prisma.agent.findFirst({
            where: { id, organizationId, deletedAt: null },
            include: {
                createdBy: {
                    select: { id: true, firstName: true, lastName: true, avatar: true }
                }
            }
        });
    }
    async findAgentBySlug(organizationId, slug) {
        return prisma_1.prisma.agent.findFirst({
            where: { slug, organizationId, deletedAt: null }
        });
    }
    async createAgent(data) {
        return prisma_1.prisma.agent.create({
            data
        });
    }
    async updateAgent(_organizationId, id, data) {
        return prisma_1.prisma.agent.update({
            where: { id },
            data
        });
    }
    async softDeleteAgent(_organizationId, id) {
        const agent = await prisma_1.prisma.agent.findUnique({ where: { id } });
        const deletedSlug = agent ? `${agent.slug}-deleted-${Date.now()}` : `deleted-${Date.now()}`;
        return prisma_1.prisma.agent.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                status: 'ARCHIVED',
                slug: deletedSlug
            }
        });
    }
    async getKnowledgeBases(organizationId, agentId) {
        return prisma_1.prisma.agentKnowledgeBase.findMany({
            where: {
                agentId,
                knowledgeBase: { organizationId, deletedAt: null }
            },
            include: {
                knowledgeBase: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async addKnowledgeBases(agentId, knowledgeBaseIds) {
        // Bulk insert ignore conflicts
        const data = knowledgeBaseIds.map(kbId => ({
            agentId,
            knowledgeBaseId: kbId
        }));
        return prisma_1.prisma.agentKnowledgeBase.createMany({
            data,
            skipDuplicates: true
        });
    }
    async removeKnowledgeBase(agentId, knowledgeBaseId) {
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
exports.AgentRepository = AgentRepository;
