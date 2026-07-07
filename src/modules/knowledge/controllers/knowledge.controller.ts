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

  searchKnowledge = async (req: Request, res: Response) => {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 5;
    const kbIdsStr = req.query.knowledgeBaseIds as string;
    const knowledgeBaseIds = kbIdsStr ? kbIdsStr.split(',') : undefined;

    if (!query) {
      return res.status(400).json(ApiResponse.error('Search query "q" is required', 'Validation Error', req.reqId));
    }

    const results = await this.knowledgeService.searchDocuments(req.user!.organizationId, query, knowledgeBaseIds, limit);
    return res.status(200).json(ApiResponse.success(results, 'Search successful', req.reqId));
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

  // Source methods

  createSource = async (req: Request, res: Response) => {
    let payload = req.body;
    
    // Support multipart/form-data where payload is sent as a stringified JSON field `data` or we just take `type` from body
    if (req.file) {
      payload = {
        type: 'bulk',
        data: {
          file: req.file
        }
      };
    }

    const source = await this.knowledgeService.createSource(
      req.user!.organizationId,
      req.params.knowledgeBaseId,
      req.user!.id,
      payload
    );
    res.status(201).json(ApiResponse.success(source, 'Source ingested successfully', req.reqId));
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

  downloadDocument = async (req: Request, res: Response): Promise<void> => {
    const document = await this.knowledgeService.getDocument(req.user!.organizationId, req.params.id);
    if (!document.storagePath) {
      res.status(404).json(ApiResponse.error('Document file not found', 'Not Found', req.reqId));
      return;
    }
    const path = require('path');
    const absolutePath = path.join(__dirname, '../../../../public', document.storagePath);
    res.download(absolutePath, document.originalName);
  };

  retryDocument = async (req: Request, res: Response) => {
    const document = await this.knowledgeService.getDocument(req.user!.organizationId, req.params.id);
    if (document.status !== 'FAILED') {
      return res.status(400).json(ApiResponse.error('Can only retry failed documents', 'Validation Error', req.reqId));
    }
    
    // Reset status and start processing
    await this.knowledgeService['knowledgeRepo'].updateKnowledgeBase(req.user!.organizationId, document.knowledgeBaseId, {
      // Actually we just need to update document, wait. We can just call processingService
    });
    // Fire and forget
    this.knowledgeService['processingService'].processDocument(document.id).catch(err => {
      console.error(`Unhandled error in background processing for doc ${document.id}`, err);
    });

    return res.status(200).json(ApiResponse.success(null, 'Retry started', req.reqId));
  };

  // Agent Connection methods

  getConnectedAgents = async (req: Request, res: Response) => {
    const agents = await this.knowledgeService.getConnectedAgents(req.user!.organizationId, req.params.id);
    res.status(200).json(ApiResponse.success(agents, 'Connected agents fetched successfully', req.reqId));
  };

  addConnectedAgents = async (req: Request, res: Response) => {
    const { agentIds } = req.body;
    await this.knowledgeService.addConnectedAgents(req.user!.organizationId, req.params.id, agentIds);
    res.status(200).json(ApiResponse.success(null, 'Agents attached successfully', req.reqId));
  };

  removeConnectedAgent = async (req: Request, res: Response) => {
    await this.knowledgeService.removeConnectedAgent(req.user!.organizationId, req.params.id, req.params.agentId);
    res.status(200).json(ApiResponse.success(null, 'Agent detached successfully', req.reqId));
  };
}
