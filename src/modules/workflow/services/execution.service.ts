import { WorkflowExecution } from '@prisma/client';
import { prisma } from '../prisma';
import { WorkflowExecutionContext, VariableManager } from '../engine/context.engine';
import { ExecutionEngine } from '../engine/execution.engine';
import { WorkflowDefinition } from '../types';

const executionEngine = new ExecutionEngine();

export class ExecutionService {
  
  async startExecution(
    workflowId: string,
    initialVariables: Record<string, any> = {},
    agentId?: string
  ): Promise<WorkflowExecution> {
    const [workflow, version] = await Promise.all([
      prisma.workflow.findUnique({ where: { id: workflowId } }),
      prisma.workflowVersion.findFirst({ where: { workflowId, published: true } })
    ]);
    if (!workflow) throw new Error('Workflow not found');
    if (!version) throw new Error('No published version found for workflow');

    const [organization, agent] = await Promise.all([
      prisma.organization.findUnique({ where: { id: workflow.organizationId } }),
      agentId ? (prisma.agent.findUnique({ where: { id: agentId } }).then(a => a || undefined)) : Promise.resolve(undefined)
    ]);
    if (!organization) throw new Error('Organization not found');

    const variableManager = new VariableManager(workflow.organizationId, {
      execution: initialVariables,
      agent: agent ? { id: agent.id, name: agent.name } : {}
    });

    const execution = await prisma.workflowExecution.create({
      data: {
        workflowVersionId: version.id,
        organizationId: workflow.organizationId,
        workflowId: workflow.id,
        status: 'PENDING',
        state: JSON.stringify(variableManager.getScopeWithoutSecrets())
      }
    });

    console.log(`[ExecutionService] startExecution called for workflow ${workflowId}. Resolved version ID: ${version.id}, version number: ${version.version}`);

    const definition: WorkflowDefinition = {
      nodes: JSON.parse(version.nodes),
      edges: JSON.parse(version.connections)
    };

    const context = new WorkflowExecutionContext({
      workflow,
      version,
      execution,
      organization,
      agent,
      definition,
      variableManager
    });

    // Run execution immediately (asynchronous in real app, synchronous here for test validation)
    console.log(`[ExecutionService] Invoking executionEngine.run for execution ${execution.id}`);
    executionEngine.run(context).catch(e => console.error('Workflow Execution Failed:', e));

    return execution;
  }

  async resumeExecution(
    executionId: string,
    nodeId: string,
    approvalData: any = {}
  ): Promise<void> {
    const execution = await prisma.workflowExecution.findUnique({
      where: { id: executionId }
    });
    if (!execution) throw new Error('Execution not found');

    const version = await prisma.workflowVersion.findUnique({
      where: { id: execution.workflowVersionId }
    });
    if (!version) throw new Error('Version not found');

    const workflow = await prisma.workflow.findUnique({
      where: { id: version.workflowId }
    });
    if (!workflow) throw new Error('Workflow not found');

    const organization = await prisma.organization.findUnique({
      where: { id: execution.organizationId }
    });
    if (!organization) throw new Error('Organization not found');

    const definition: WorkflowDefinition = {
      nodes: JSON.parse(version.nodes),
      edges: JSON.parse(version.connections)
    };

    const variableManager = new VariableManager(execution.organizationId, JSON.parse(execution.state || '{}'));
    const agentId = variableManager.getScope().agent?.id;
    const agent = agentId ? (await prisma.agent.findUnique({ where: { id: agentId } }) || undefined) : undefined;

    const context = new WorkflowExecutionContext({
      workflow,
      version,
      execution,
      organization,
      agent,
      definition,
      variableManager
    });

    // Resume execution
    executionEngine.resume(context, nodeId, approvalData).catch(e => console.error('Workflow Resume Failed:', e));
  }
}
