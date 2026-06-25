"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
            prisma.knowledgeBase.findMany({
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
            prisma.knowledgeBase.count({ where })
        ]);
        return { items, total };
    }
    async findKnowledgeBaseById(organizationId, id) {
        return prisma.knowledgeBase.findFirst({
            where: { id, organizationId, deletedAt: null },
            include: {
                createdBy: {
                    select: { id: true, firstName: true, lastName: true, avatar: true }
                }
            }
        });
    }
    async createKnowledgeBase(data) {
        return prisma.knowledgeBase.create({
            data
        });
    }
    async updateKnowledgeBase(_organizationId, id, data) {
        return prisma.knowledgeBase.update({
            where: { id },
            data
        });
    }
    async softDeleteKnowledgeBase(_organizationId, id) {
        return prisma.knowledgeBase.update({
            where: { id },
            data: {
                deletedAt: new Date()
            }
        });
    }
    // Document methods
    async createKnowledgeDocument(data) {
        return prisma.knowledgeDocument.create({
            data
        });
    }
    async findKnowledgeDocuments(organizationId, knowledgeBaseId) {
        return prisma.knowledgeDocument.findMany({
            where: {
                organizationId,
                knowledgeBaseId,
                deletedAt: null
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findKnowledgeDocumentById(organizationId, id) {
        return prisma.knowledgeDocument.findFirst({
            where: {
                id,
                organizationId,
                deletedAt: null
            }
        });
    }
    async softDeleteKnowledgeDocument(_organizationId, id) {
        return prisma.knowledgeDocument.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                status: 'DELETED'
            }
        });
    }
}
exports.KnowledgeRepository = KnowledgeRepository;
