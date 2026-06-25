import { Request, Response } from 'express';
import { AgentRuntimeService } from '../services/agent-runtime.service';

export class AgentRuntimeController {
  private service = new AgentRuntimeService();

  public startExecution = async (req: Request, res: Response) => {
    try {
      const { organizationId, agentId } = req.params;
      const { goal, sessionId, variables } = req.body;
      const result = await this.service.startExecution(organizationId, agentId, goal, sessionId, variables);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  public pauseExecution = async (req: Request, res: Response) => {
    try {
      const { executionId } = req.params;
      const result = await this.service.pauseExecution(executionId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  public resumeExecution = async (req: Request, res: Response) => {
    try {
      const { executionId } = req.params;
      const result = await this.service.resumeExecution(executionId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  public cancelExecution = async (req: Request, res: Response) => {
    try {
      const { executionId } = req.params;
      const result = await this.service.cancelExecution(executionId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  public getAgentMetadata = async (req: Request, res: Response) => {
    try {
      const { organizationId, agentId } = req.params;
      const metadata = await this.service.getAgentMetadata(organizationId, agentId);
      if (!metadata) {
        res.status(404).json({ error: 'Agent not found' });
        return;
      }
      res.status(200).json(metadata);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
