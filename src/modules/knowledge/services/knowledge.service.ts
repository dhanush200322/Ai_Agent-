import { KnowledgeRepository } from '../repositories/knowledge.repository';
import { AuditLogger } from '../../../shared/audit/auditLogger';
import { NotFoundError } from '../../../shared/errors/AppError';
import { DocumentProcessingService } from './document-processing.service';

export class KnowledgeService {
  private processingService = new DocumentProcessingService();
  private knowledgeRepo = new KnowledgeRepository();

  async getKnowledgeBases(organizationId: string, page: number, limit: number, search?: string) {
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

  async getKnowledgeBase(organizationId: string, id: string) {
    const kb = await this.knowledgeRepo.findKnowledgeBaseById(organizationId, id);
    if (!kb) throw new NotFoundError('Knowledge Base not found');
    return kb;
  }

  async createKnowledgeBase(organizationId: string, userId: string, data: any) {
    const kbData: any = {
      name: data.name,
      organizationId,
      createdById: userId
    };
    if (data.description !== undefined) kbData.description = data.description;

    const kb = await this.knowledgeRepo.createKnowledgeBase(kbData);

    AuditLogger.log('KNOWLEDGE_BASE_CREATED', 'knowledge', { knowledgeBaseId: kb.id, organizationId });
    return kb;
  }

  async updateKnowledgeBase(organizationId: string, id: string, data: any) {
    const kb = await this.knowledgeRepo.findKnowledgeBaseById(organizationId, id);
    if (!kb) throw new NotFoundError('Knowledge Base not found');

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;

    const updated = await this.knowledgeRepo.updateKnowledgeBase(organizationId, id, updateData);
    AuditLogger.log('KNOWLEDGE_BASE_UPDATED', 'knowledge', { knowledgeBaseId: id, organizationId });
    return updated;
  }

  async softDeleteKnowledgeBase(organizationId: string, id: string) {
    const kb = await this.knowledgeRepo.findKnowledgeBaseById(organizationId, id);
    if (!kb) throw new NotFoundError('Knowledge Base not found');

    await this.knowledgeRepo.softDeleteKnowledgeBase(organizationId, id);
    AuditLogger.log('KNOWLEDGE_BASE_DELETED', 'knowledge', { knowledgeBaseId: id, organizationId });
    return { success: true };
  }

  // Source methods

  async createSource(organizationId: string, knowledgeBaseId: string, userId: string, payload: any) {
    const kb = await this.knowledgeRepo.findKnowledgeBaseById(organizationId, knowledgeBaseId);
    if (!kb) throw new NotFoundError('Knowledge Base not found');

    const type = payload.type?.toUpperCase();
    if (!['WEBSITE', 'FAQ', 'TEXT'].includes(type)) {
      throw new Error(`Invalid source type: ${type}`);
    }

    let originalName = 'Unknown Source';
    if (type === 'WEBSITE') originalName = payload.data.url || 'Website URL';
    if (type === 'FAQ') originalName = payload.data.name || 'FAQ Import';
    if (type === 'TEXT') originalName = payload.data.name || 'Manual Notes';

    const docData = {
      knowledgeBaseId,
      organizationId,
      uploadedById: userId,
      originalName,
      status: 'PENDING',
      sourceType: type,
      metadata: JSON.stringify(payload.data || {})
    };

    const source = await this.knowledgeRepo.createKnowledgeDocument(docData as any);
    
    // Fire and forget document processing
    this.processingService.processDocument(source.id).catch(err => {
      console.error(`Unhandled error in background processing for source ${source.id}`, err);
    });

    AuditLogger.log('KNOWLEDGE_SOURCE_CREATED', 'knowledge', { sourceId: source.id, knowledgeBaseId, organizationId });
    return source;
  }

  // Document methods

  async uploadDocument(organizationId: string, knowledgeBaseId: string, userId: string, file: any) {
    const kb = await this.knowledgeRepo.findKnowledgeBaseById(organizationId, knowledgeBaseId);
    if (!kb) throw new NotFoundError('Knowledge Base not found');

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
      status: 'PENDING'
    };

    const document = await this.knowledgeRepo.createKnowledgeDocument(docData);
    
    // Fire and forget document processing
    this.processingService.processDocument(document.id).catch(err => {
      console.error(`Unhandled error in background processing for doc ${document.id}`, err);
    });

    AuditLogger.log('KNOWLEDGE_DOCUMENT_UPLOADED', 'knowledge', { documentId: document.id, knowledgeBaseId, organizationId });
    return document;
  }

  async getDocuments(organizationId: string, knowledgeBaseId: string) {
    const kb = await this.knowledgeRepo.findKnowledgeBaseById(organizationId, knowledgeBaseId);
    if (!kb) throw new NotFoundError('Knowledge Base not found');

    return this.knowledgeRepo.findKnowledgeDocuments(organizationId, knowledgeBaseId);
  }

  async getDocument(organizationId: string, id: string) {
    const doc = await this.knowledgeRepo.findKnowledgeDocumentById(organizationId, id);
    if (!doc) throw new NotFoundError('Knowledge Document not found');
    return doc;
  }

  async softDeleteDocument(organizationId: string, id: string) {
    const doc = await this.knowledgeRepo.findKnowledgeDocumentById(organizationId, id);
    if (!doc) throw new NotFoundError('Knowledge Document not found');

    await this.knowledgeRepo.softDeleteKnowledgeDocument(organizationId, id);
    AuditLogger.log('KNOWLEDGE_DOCUMENT_DELETED', 'knowledge', { documentId: id, organizationId });
    return { success: true };
  }

  // Agent Connection methods

  async getConnectedAgents(organizationId: string, knowledgeBaseId: string) {
    await this.getKnowledgeBase(organizationId, knowledgeBaseId);
    const agentKbs = await this.knowledgeRepo.getConnectedAgents(organizationId, knowledgeBaseId);
    return agentKbs.map(akb => akb.agent);
  }

  async addConnectedAgents(organizationId: string, knowledgeBaseId: string, agentIds: string[]) {
    await this.getKnowledgeBase(organizationId, knowledgeBaseId);
    await this.knowledgeRepo.addConnectedAgents(knowledgeBaseId, agentIds);
    AuditLogger.log('KNOWLEDGE_BASE_AGENTS_ATTACHED', 'knowledge', { knowledgeBaseId, organizationId, agentIds });
    return { success: true };
  }

  async removeConnectedAgent(organizationId: string, knowledgeBaseId: string, agentId: string) {
    await this.getKnowledgeBase(organizationId, knowledgeBaseId);
    await this.knowledgeRepo.removeConnectedAgent(knowledgeBaseId, agentId);
    AuditLogger.log('KNOWLEDGE_BASE_AGENT_DETACHED', 'knowledge', { knowledgeBaseId, organizationId, agentId });
    return { success: true };
  }
}

