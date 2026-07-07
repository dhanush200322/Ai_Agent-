import { Request, Response } from 'express';
import { AgentService } from '../services/agent.service';
import { StorageService } from '../../../shared/utils/storage.service';
import { ApiResponse } from '../../../shared/response/ApiResponse';

export class AgentController {
  private agentService = new AgentService();

  getAgents = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    
    const data = await this.agentService.getAgents(req.user!.organizationId, page, limit, search);
    res.status(200).json(ApiResponse.success(data, 'Agents fetched successfully', req.reqId));
  };

  getAgent = async (req: Request, res: Response) => {
    const agent = await this.agentService.getAgent(req.user!.organizationId, req.params.id);
    res.status(200).json(ApiResponse.success(agent, 'Agent fetched successfully', req.reqId));
  };

  createAgent = async (req: Request, res: Response) => {
    console.log('REQ_USER', req.user);
    console.log('REQ_BODY', req.body);
    let payload = { ...req.body };
    if (req.file) {
      payload.avatar = StorageService.getFileUrl(req.file.filename);
    }
    const agent = await this.agentService.createAgent(req.user!.organizationId, req.user!.id, payload);
    res.status(201).json(ApiResponse.success(agent, 'Agent created successfully', req.reqId));
  };

  updateAgent = async (req: Request, res: Response) => {
    let payload = { ...req.body };
    if (req.file) {
      payload.avatar = StorageService.getFileUrl(req.file.filename);
      // Clean up old avatar if exists
      try {
        const existingAgent = await this.agentService.getAgent(req.user!.organizationId, req.params.id);
        if (existingAgent && existingAgent.avatar) {
          await StorageService.deleteFile(existingAgent.avatar);
        }
      } catch (e) {
        console.error('Failed to cleanup old avatar', e);
      }
    }
    const agent = await this.agentService.updateAgent(req.user!.organizationId, req.params.id, payload);
    res.status(200).json(ApiResponse.success(agent, 'Agent updated successfully', req.reqId));
  };

  deleteAgent = async (req: Request, res: Response) => {
    await this.agentService.softDeleteAgent(req.user!.organizationId, req.params.id);
    res.status(200).json(ApiResponse.success(null, 'Agent deleted successfully', req.reqId));
  };

  getKnowledgeBases = async (req: Request, res: Response) => {
    const kbs = await this.agentService.getKnowledgeBases(req.user!.organizationId, req.params.id);
    res.status(200).json(ApiResponse.success(kbs, 'Knowledge Bases fetched successfully', req.reqId));
  };

  addKnowledgeBases = async (req: Request, res: Response) => {
    const { knowledgeBaseIds } = req.body;
    await this.agentService.addKnowledgeBases(req.user!.organizationId, req.params.id, knowledgeBaseIds);
    res.status(200).json(ApiResponse.success(null, 'Knowledge Bases attached successfully', req.reqId));
  };

  removeKnowledgeBase = async (req: Request, res: Response) => {
    await this.agentService.removeKnowledgeBase(req.user!.organizationId, req.params.id, req.params.kbId);
    res.status(200).json(ApiResponse.success(null, 'Knowledge Base detached successfully', req.reqId));
  };
}

// Trigger restart to clear PermissionCache
