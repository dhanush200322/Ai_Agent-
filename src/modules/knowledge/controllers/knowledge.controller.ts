import { Request, Response } from 'express';
import { KnowledgeService } from '../services/knowledge.service';
import { ApiResponse } from '../../../shared/response/ApiResponse';

export class KnowledgeController {
  private knowledgeService = new KnowledgeService();

  getKnowledgeBases = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    
    const data = await this.knowledgeService.getKnowledgeBases(req.user!.organizationId, page, limit, search);
    res.status(200).json(ApiResponse.success(data, 'Knowledge Bases fetched successfully', req.reqId));
  };

  getKnowledgeBase = async (req: Request, res: Response) => {
    const kb = await this.knowledgeService.getKnowledgeBase(req.user!.organizationId, req.params.id);
    res.status(200).json(ApiResponse.success(kb, 'Knowledge Base fetched successfully', req.reqId));
  };

  createKnowledgeBase = async (req: Request, res: Response) => {
    const kb = await this.knowledgeService.createKnowledgeBase(req.user!.organizationId, req.user!.id, req.body);
    res.status(201).json(ApiResponse.success(kb, 'Knowledge Base created successfully', req.reqId));
  };

  updateKnowledgeBase = async (req: Request, res: Response) => {
    const kb = await this.knowledgeService.updateKnowledgeBase(req.user!.organizationId, req.params.id, req.body);
    res.status(200).json(ApiResponse.success(kb, 'Knowledge Base updated successfully', req.reqId));
  };

  deleteKnowledgeBase = async (req: Request, res: Response) => {
    await this.knowledgeService.softDeleteKnowledgeBase(req.user!.organizationId, req.params.id);
    res.status(200).json(ApiResponse.success(null, 'Knowledge Base deleted successfully', req.reqId));
  };

  // Document methods

  uploadDocument = async (req: Request, res: Response): Promise<void> => {
    console.log("[DEBUG controller] req.file =", req.file);
    console.log("[DEBUG controller] req.body =", req.body);
    console.log("[DEBUG controller] req.params =", req.params);
    if (!req.file) {
      res.status(400).json(ApiResponse.error('File is required', 'Validation Error', req.reqId));
      return;
    }
    const document = await this.knowledgeService.uploadDocument(req.user!.organizationId, req.params.knowledgeBaseId, req.user!.id, req.file);
    res.status(201).json(ApiResponse.success(document, 'Document uploaded successfully', req.reqId));
  };

  getDocuments = async (req: Request, res: Response) => {
    const documents = await this.knowledgeService.getDocuments(req.user!.organizationId, req.params.knowledgeBaseId);
    res.status(200).json(ApiResponse.success(documents, 'Documents fetched successfully', req.reqId));
  };

  getDocument = async (req: Request, res: Response) => {
    const document = await this.knowledgeService.getDocument(req.user!.organizationId, req.params.id);
    res.status(200).json(ApiResponse.success(document, 'Document fetched successfully', req.reqId));
  };

  deleteDocument = async (req: Request, res: Response) => {
    await this.knowledgeService.softDeleteDocument(req.user!.organizationId, req.params.id);
    res.status(200).json(ApiResponse.success(null, 'Document deleted successfully', req.reqId));
  };
}
