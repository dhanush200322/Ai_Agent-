import { WorkflowService } from '../services/workflow.service';
import { ExecutionService } from '../services/execution.service';

const workflowService = new WorkflowService();
const executionService = new ExecutionService();

export class WorkflowController {
  
  static async createWorkflow(req: any, res: any) {
    try {
      const { organizationId, name, slug, description } = req.body;
      const wf = await workflowService.createWorkflow(organizationId, req.user.id, name, slug, description);
      res.json(wf);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  static async deployVersion(req: any, res: any) {
    try {
      const { workflowId } = req.params;
      const { nodes, connections, metadata } = req.body;
      const v = await workflowService.createVersion(workflowId, nodes, connections, metadata);
      const published = await workflowService.publishVersion(v.id);
      res.json(published);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  static async startExecution(req: any, res: any) {
    try {
      const { workflowId } = req.params;
      const { variables, agentId } = req.body;
      const ex = await executionService.startExecution(workflowId, variables, agentId);
      res.json(ex);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  static async approveExecution(req: any, res: any) {
    try {
      const { executionId, nodeId } = req.params;
      const approvalData = req.body;
      await executionService.resumeExecution(executionId, nodeId, approvalData);
      res.json({ success: true, message: 'Execution Resumed' });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }
}
