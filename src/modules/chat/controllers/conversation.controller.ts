import { Request, Response } from 'express';
import { ConversationService } from '../services/conversation.service';
import { ConversationMessageService } from '../services/conversation-message.service';

const conversationService = new ConversationService();
const messageService = new ConversationMessageService();

export class ConversationController {
  public createConversation = async (req: Request, res: Response) => {
    try {
      const { sessionId, agentId } = req.body;
      const conversation = await conversationService.createConversation({
        sessionId,
        agentId,
        organizationId: req.user!.organizationId,
        userId: req.user!.id
      });
      res.status(201).json({ success: true, data: conversation });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  };

  public listConversations = async (req: Request, res: Response) => {
    try {
      const skip = parseInt(req.query.skip as string) || 0;
      const limit = parseInt(req.query.limit as string) || 20;
      const { agentId, status } = req.query;
      
      const result = await conversationService.listConversations({
        organizationId: req.user!.organizationId,
        userId: req.user!.id,
        agentId: agentId as string,
        status: status as any,
        skip,
        limit
      });
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  };

  public getConversationDetails = async (req: Request, res: Response) => {
    try {
      const conversation = await conversationService.getConversationById(req.params.id, req.user!.organizationId);
      res.status(200).json({ success: true, data: conversation });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  };

  public deleteConversation = async (req: Request, res: Response) => {
    try {
      await conversationService.deleteConversation(req.params.id, req.user!.organizationId);
      res.status(200).json({ success: true, message: 'Conversation deleted' });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  };

  public archiveConversation = async (req: Request, res: Response) => {
    try {
      await conversationService.archiveConversation(req.params.id, req.user!.organizationId);
      res.status(200).json({ success: true, message: 'Conversation archived' });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  };

  public restoreConversation = async (req: Request, res: Response) => {
    try {
      await conversationService.restoreConversation(req.params.id, req.user!.organizationId);
      res.status(200).json({ success: true, message: 'Conversation restored' });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  };

  public getConversationHistory = async (req: Request, res: Response) => {
    try {
      // Validate they own it
      await conversationService.getConversationById(req.params.conversationId, req.user!.organizationId);
      
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = parseInt(req.query.skip as string) || 0;
      
      const history = await messageService.getHistory(req.params.conversationId, limit, skip);
      res.status(200).json({ success: true, data: history });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  };
}
