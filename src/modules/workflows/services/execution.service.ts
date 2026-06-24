// @ts-nocheck
import { PrismaClient, WorkflowExecution } from '@prisma/client';
import { WorkflowExecutionContext } from '../engine/context';
import { VariableManager } from '../engine/variable-manager';
import { ImmediateDispatcher } from '../engine/dispatcher';
import { WorkflowDefinition } from '../types/workflow.types';

const prisma = new PrismaClient();
const dispatcher = new ImmediateDispatcher();

export class ExecutionService {
  
  async startExecution(workflowId: string, initialVariables: Record<string, any> = {}, agentId?: string): Promise<WorkflowExecution> {
    const workflow = await prisma.workflow.findUnique({ where: { id: workflowId }});
    if (!workflow) throw new Error('Workflow not found');

    const version = await prisma.workflowVersion.findFirst({
      where: { workflowId, published: true }
    });
    if (!version) throw new Error('No published version found for workflow');

    const organization = await prisma.organization.findUnique({ where: { id: workflow.organizationId }});
    let agent = undefined;
    if (agentId) {
      agent = await prisma.agent.findUnique({ where: { id: agentId }}) || undefined;
    }

    const execution = await prisma.workflowExecution.create({
      data: {
        workflowVersionId: version.id,
        organizationId: workflow.organizationId,
        status: 'PENDING'
      }
    });

    const definition: WorkflowDefinition = {
      nodes: JSON.parse(version.nodes),
      edges: JSON.parse(version.connections)
    };

    const variableManager = new VariableManager({ execution: initialVariables });

    const context = new WorkflowExecutionContext({
      workflow,
      version,
      execution,
      organization: organization!,
      agent,
      definition,
      variableManager
    });

    // Start asynchronously (in real app, dispatcher.dispatch would push to queue)
    dispatcher.dispatch(context).catch(e => console.error('Workflow Failed:', e));

    return execution;
  }

  async resumeExecution(executionId: string, nodeId: string, approvalData: any = {}): Promise<void> {
    const execution = await prisma.workflowExecution.findUnique({ where: { id: executionId }});
    if (!execution) throw new Error('Execution not found');
    
    const version = await prisma.workflowVersion.findUnique({ where: { id: execution.workflowVersionId }});
    const workflow = await prisma.workflow.findUnique({ where: { id: version!.workflowId }});
    const organization = await prisma.organization.findUnique({ where: { id: execution.organizationId }});

    const definition: WorkflowDefinition = {
      nodes: JSON.parse(version!.nodes),
      edges: JSON.parse(version!.connections)
    };

    const variableManager = new VariableManager(JSON.parse(execution.state || '{}'));

    const context = new WorkflowExecutionContext({
      workflow: workflow!,
      version: version!,
      execution,
      organization: organization!,
      definition,
      variableManager
    });

    // Resume asynchronously
    dispatcher.resume(context, nodeId, approvalData).catch(e => console.error('Workflow Resume Failed:', e));
  }
}
