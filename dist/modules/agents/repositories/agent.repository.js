"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
            prisma.agent.findMany({
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
            prisma.agent.count({ where })
        ]);
        return { items, total };
    }
    async findAgentById(organizationId, id) {
        return prisma.agent.findFirst({
            where: { id, organizationId, deletedAt: null },
            include: {
                createdBy: {
                    select: { id: true, firstName: true, lastName: true, avatar: true }
                }
            }
        });
    }
    async findAgentBySlug(organizationId, slug) {
        return prisma.agent.findFirst({
            where: { slug, organizationId, deletedAt: null }
        });
    }
    async createAgent(data) {
        return prisma.agent.create({
            data
        });
    }
    async updateAgent(_organizationId, id, data) {
        return prisma.agent.update({
            where: { id },
            data
        });
    }
    async softDeleteAgent(_organizationId, id) {
        return prisma.agent.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                status: 'ARCHIVED'
            }
        });
    }
    async getKnowledgeBases(organizationId, agentId) {
        return prisma.agentKnowledgeBase.findMany({
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
        return prisma.agentKnowledgeBase.createMany({
            data,
            skipDuplicates: true
        });
    }
    async removeKnowledgeBase(agentId, knowledgeBaseId) {
        return prisma.agentKnowledgeBase.delete({
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
