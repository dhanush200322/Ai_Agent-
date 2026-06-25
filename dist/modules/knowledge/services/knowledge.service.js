"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeService = void 0;
const knowledge_repository_1 = require("../repositories/knowledge.repository");
const auditLogger_1 = require("../../../shared/audit/auditLogger");
const AppError_1 = require("../../../shared/errors/AppError");
const document_processing_service_1 = require("./document-processing.service");
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
    // Document methods
    async uploadDocument(organizationId, knowledgeBaseId, userId, file) {
        const kb = await this.knowledgeRepo.findKnowledgeBaseById(organizationId, knowledgeBaseId);
        if (!kb)
            throw new AppError_1.NotFoundError('Knowledge Base not found');
        const docData = {
            knowledgeBaseId,
            organizationId,
            uploadedById: userId,
            originalName: file.originalname,
            fileName: file.filename,
            mimeType: file.mimetype,
            extension: file.originalname.split('.').pop() || '',
            size: file.size,
            storagePath: `/uploads/${file.filename}`,
            status: 'PENDING'
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
    async softDeleteDocument(organizationId, id) {
        const doc = await this.knowledgeRepo.findKnowledgeDocumentById(organizationId, id);
        if (!doc)
            throw new AppError_1.NotFoundError('Knowledge Document not found');
        await this.knowledgeRepo.softDeleteKnowledgeDocument(organizationId, id);
        auditLogger_1.AuditLogger.log('KNOWLEDGE_DOCUMENT_DELETED', 'knowledge', { documentId: id, organizationId });
        return { success: true };
    }
}
exports.KnowledgeService = KnowledgeService;
