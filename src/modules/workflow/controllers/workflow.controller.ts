import { prisma } from '../../../shared/prisma';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { WorkflowService } from '../services/workflow.service';
import { ExecutionService } from '../services/execution.service';
import { TemplateEngine } from '../engine/template.engine';


const workflowService = new WorkflowService();
const executionService = new ExecutionService();
const templateEngine = new TemplateEngine();

export class WorkflowController {
  
  async createWorkflow(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { name, slug, description } = req.body;
      const wf = await workflowService.createWorkflow(user.organizationId, user.id, name, slug, description);
      res.status(211).json(wf); // 211 or 201 Created
    } catch (err) {
      next(err);
    }
  }

  async updateWorkflow(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await workflowService.updateWorkflow(id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  async deleteWorkflow(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await workflowService.deleteWorkflowSoft(id);
      res.json(deleted);
    } catch (err) {
      next(err);
    }
  }

  async getWorkflows(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const workflows = await prisma.workflow.findMany({
        where: { organizationId: user.organizationId, deletedAt: null },
        include: { versions: true }
      });
      res.json(workflows);
    } catch (err) {
      next(err);
    }
  }

  async publishVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const { versionId } = req.body;
      if (!versionId) {
        res.status(400).json({ error: 'Missing versionId in request body.' });
        return;
      }
      const version = await workflowService.publishVersion(versionId);
      res.json(version);
    } catch (err) {
      next(err);
    }
  }

  async executeWorkflow(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { variables, agentId } = req.body;
      const execution = await executionService.startExecution(id, variables || {}, agentId);
      res.json(execution);
    } catch (err) {
      next(err);
    }
  }

  async cancelExecution(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // executionId
      const execution = await prisma.workflowExecution.update({
        where: { id },
        data: { status: 'CANCELED', finishedAt: new Date() }
      });
      res.json(execution);
    } catch (err) {
      next(err);
    }
  }

  async cloneWorkflow(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params;
      const { name, slug } = req.body;
      const cloned = await workflowService.duplicateWorkflow(id, name, slug);
      res.json(cloned);
    } catch (err) {
      next(err);
    }
  }

  async getWorkflowHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // workflowId
      const executions = await prisma.workflowExecution.findMany({
        where: { workflowId: id },
        include: { logs: true, steps: true },
        orderBy: { startedAt: 'desc' }
      });
      res.json(executions);
    } catch (err) {
      next(err);
    }
  }

  async approveWorkflow(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // executionId
      const { nodeId, approved, notes } = req.body;
      await executionService.resumeExecution(id, nodeId, { approved, notes });
      res.json({ success: true, message: 'Approval response processed.' });
    } catch (err) {
      next(err);
    }
  }

  async getExecutions(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const executions = await prisma.workflowExecution.findMany({
        where: { organizationId: user.organizationId },
        orderBy: { startedAt: 'desc' }
      });
      res.json(executions);
    } catch (err) {
      next(err);
    }
  }

  async getTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const templates = await templateEngine.listTemplates(user.organizationId);
      res.json(templates);
    } catch (err) {
      next(err);
    }
  }
}
