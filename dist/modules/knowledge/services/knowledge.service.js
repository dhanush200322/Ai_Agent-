"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeService = void 0;
const knowledge_repository_1 = require("../repositories/knowledge.repository");
const auditLogger_1 = require("../../../shared/audit/auditLogger");
const AppError_1 = require("../../../shared/errors/AppError");
const document_processing_service_1 = require("./document-processing.service");
const prisma_1 = require("../../../shared/prisma");
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
class KnowledgeService {
    processingService = new document_processing_service_1.DocumentProcessingService();
    knowledgeRepo = new knowledge_repository_1.KnowledgeRepository();
    async getKnowledgeBases(organizationId, page, limit, search) {
        const skip = (page - 1) * limit;
        const { items, total } = await this.knowledgeRepo.findKnowledgeBases(organizationId, skip, limit, search);
        return {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
            items
        };
    }
    async getKnowledgeBase(organizationId, id) {
        const kb = await this.knowledgeRepo.findKnowledgeBaseById(organizationId, id);
        if (!kb)
            throw new AppError_1.NotFoundError('Knowledge Base not found');
        return kb;
    }
    async createKnowledgeBase(organizationId, userId, data) {
        const kbData = {
            name: data.name,
            organizationId,
            createdById: userId
        };
        if (data.description !== undefined)
            kbData.description = data.description;
        const kb = await this.knowledgeRepo.createKnowledgeBase(kbData);
        auditLogger_1.AuditLogger.log('KNOWLEDGE_BASE_CREATED', 'knowledge', { knowledgeBaseId: kb.id, organizationId });
        return kb;
    }
    async updateKnowledgeBase(organizationId, id, data) {
        const kb = await this.knowledgeRepo.findKnowledgeBaseById(organizationId, id);
        if (!kb)
            throw new AppError_1.NotFoundError('Knowledge Base not found');
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.description !== undefined)
            updateData.description = data.description;
        const updated = await this.knowledgeRepo.updateKnowledgeBase(organizationId, id, updateData);
        auditLogger_1.AuditLogger.log('KNOWLEDGE_BASE_UPDATED', 'knowledge', { knowledgeBaseId: id, organizationId });
        return updated;
    }
    async softDeleteKnowledgeBase(organizationId, id) {
        const kb = await this.knowledgeRepo.findKnowledgeBaseById(organizationId, id);
        if (!kb)
            throw new AppError_1.NotFoundError('Knowledge Base not found');
        await this.knowledgeRepo.softDeleteKnowledgeBase(organizationId, id);
        auditLogger_1.AuditLogger.log('KNOWLEDGE_BASE_DELETED', 'knowledge', { knowledgeBaseId: id, organizationId });
        return { success: true };
    }
    // Source methods
    async createSource(organizationId, knowledgeBaseId, userId, payload) {
        const kb = await this.knowledgeRepo.findKnowledgeBaseById(organizationId, knowledgeBaseId);
        if (!kb)
            throw new AppError_1.NotFoundError('Knowledge Base not found');
        const type = payload.type?.toUpperCase();
        if (!['WEBSITE', 'FAQ', 'TEXT'].includes(type)) {
            throw new Error(`Invalid source type: ${type}`);
        }
        let originalName = 'Unknown Source';
        if (type === 'WEBSITE')
            originalName = payload.data.url || 'Website URL';
        if (type === 'FAQ')
            originalName = payload.data.name || 'FAQ Import';
        if (type === 'TEXT')
            originalName = payload.data.name || 'Manual Notes';
        const docData = {
            knowledgeBaseId,
            organizationId,
            uploadedById: userId,
            originalName,
            status: 'PENDING',
            sourceType: type,
            metadata: JSON.stringify(payload.data || {})
        };
        const source = await this.knowledgeRepo.createKnowledgeDocument(docData);
        // Fire and forget document processing
        this.processingService.processDocument(source.id).catch(err => {
            console.error(`Unhandled error in background processing for source ${source.id}`, err);
        });
        auditLogger_1.AuditLogger.log('KNOWLEDGE_SOURCE_CREATED', 'knowledge', { sourceId: source.id, knowledgeBaseId, organizationId });
        return source;
    }
    // Document methods
    async uploadDocument(organizationId, knowledgeBaseId, userId, file) {
        const kb = await this.knowledgeRepo.findKnowledgeBaseById(organizationId, knowledgeBaseId);
        if (!kb)
            throw new AppError_1.NotFoundError('Knowledge Base not found');
        const fileBuffer = fs_1.default.readFileSync(file.path);
        const hash = crypto_1.default.createHash('sha256').update(fileBuffer).digest('hex');
        // Duplicate Detection
        // @ts-ignore
        const existingDoc = await prisma_1.prisma.knowledgeDocument.findFirst({
            where: {
                organizationId,
                knowledgeBaseId,
                hash,
                deletedAt: null
            }
        });
        if (existingDoc) {
            if (fs_1.default.existsSync(file.path))
                fs_1.default.unlinkSync(file.path);
            throw new Error(`Duplicate document detected: ${existingDoc.originalName}`);
        }
        // Versioning
        const previousVersions = await prisma_1.prisma.knowledgeDocument.count({
            where: {
                organizationId,
                knowledgeBaseId,
                originalName: file.originalname,
                deletedAt: null
            }
        });
        const version = previousVersions + 1;
        const docData = {
            knowledgeBaseId,
            organizationId,
            uploadedById: userId,
            originalName: file.originalname,
            fileName: file.filename,
            mimeType: file.mimetype,
            extension: file.originalname.split('.').pop() || '',
            size: file.size,
            storagePath: `/uploads/documents/${file.filename}`,
            status: 'UPLOADING',
            hash,
            version
        };
        const document = await this.knowledgeRepo.createKnowledgeDocument(docData);
        // Fire and forget document processing
        this.processingService.processDocument(document.id).catch(err => {
            console.error(`Unhandled error in background processing for doc ${document.id}`, err);
        });
        auditLogger_1.AuditLogger.log('KNOWLEDGE_DOCUMENT_UPLOADED', 'knowledge', { documentId: document.id, knowledgeBaseId, organizationId });
        return document;
    }
    async getDocuments(organizationId, knowledgeBaseId) {
        const kb = await this.knowledgeRepo.findKnowledgeBaseById(organizationId, knowledgeBaseId);
        if (!kb)
            throw new AppError_1.NotFoundError('Knowledge Base not found');
        return this.knowledgeRepo.findKnowledgeDocuments(organizationId, knowledgeBaseId);
    }
    async getDocument(organizationId, id) {
        const doc = await this.knowledgeRepo.findKnowledgeDocumentById(organizationId, id);
        if (!doc)
            throw new AppError_1.NotFoundError('Knowledge Document not found');
        return doc;
    }
    async searchDocuments(organizationId, query, knowledgeBaseIds, limit = 5) {
        const embeddings = await this.processingService['embeddingService'].generateEmbeddings([query]);
        if (!embeddings || embeddings.length === 0) {
            throw new Error('Failed to generate embedding for query');
        }
        const queryVector = embeddings[0];
        const searchResults = await this.processingService['vectorService'].similaritySearch(organizationId, queryVector, { knowledgeBaseIds, limit });
        return searchResults;
    }
    async softDeleteDocument(organizationId, id) {
        const doc = await prisma_1.prisma.knowledgeDocument.findFirst({
            where: { id, organizationId }
        });
        if (!doc)
            throw new AppError_1.NotFoundError('Knowledge Document not found');
        // @ts-ignore
        const chunks = await prisma_1.prisma.knowledgeChunk.findMany({
            where: { documentId: id }
        });
        const vectorIds = chunks.map((c) => c.vectorId).filter(Boolean);
        try {
            // 1. Delete DB
            await prisma_1.prisma.$transaction(async (tx) => {
                // @ts-ignore
                await tx.knowledgeChunk.deleteMany({
                    where: { documentId: id }
                });
                // We do a hard delete to fully purge it, as requested
                await tx.knowledgeDocument.delete({
                    where: { id }
                });
            });
            // 2. Delete File
            if (doc.storagePath) {
                const absolutePath = path_1.default.join(__dirname, '../../../../public', doc.storagePath);
                if (fs_1.default.existsSync(absolutePath)) {
                    fs_1.default.unlinkSync(absolutePath);
                }
            }
            // 3. Delete Vectors
            if (vectorIds.length > 0) {
                await this.processingService['vectorService'].deleteVectors(vectorIds); // Access vectorService from processingService or instantiate one
            }
            auditLogger_1.AuditLogger.log('KNOWLEDGE_DOCUMENT_DELETED', 'knowledge', { documentId: id, organizationId });
            return { success: true };
        }
        catch (error) {
            console.error(`Error deleting document ${id}`, error);
            throw new Error('Failed to delete document completely');
        }
    }
    // Agent Connection methods
    async getConnectedAgents(organizationId, knowledgeBaseId) {
        await this.getKnowledgeBase(organizationId, knowledgeBaseId);
        const agentKbs = await this.knowledgeRepo.getConnectedAgents(organizationId, knowledgeBaseId);
        return agentKbs.map(akb => akb.agent);
    }
    async addConnectedAgents(organizationId, knowledgeBaseId, agentIds) {
        await this.getKnowledgeBase(organizationId, knowledgeBaseId);
        await this.knowledgeRepo.addConnectedAgents(knowledgeBaseId, agentIds);
        auditLogger_1.AuditLogger.log('KNOWLEDGE_BASE_AGENTS_ATTACHED', 'knowledge', { knowledgeBaseId, organizationId, agentIds });
        return { success: true };
    }
    async removeConnectedAgent(organizationId, knowledgeBaseId, agentId) {
        await this.getKnowledgeBase(organizationId, knowledgeBaseId);
        await this.knowledgeRepo.removeConnectedAgent(knowledgeBaseId, agentId);
        auditLogger_1.AuditLogger.log('KNOWLEDGE_BASE_AGENT_DETACHED', 'knowledge', { knowledgeBaseId, organizationId, agentId });
        return { success: true };
    }
}
exports.KnowledgeService = KnowledgeService;
