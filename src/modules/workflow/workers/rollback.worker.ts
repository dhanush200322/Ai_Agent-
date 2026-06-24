import { QueueJob } from '../../queue/providers/queue-provider.interface';
import { RollbackEngine } from '../engine/rollback.engine';
import { PrismaClient } from '@prisma/client';
import { WorkflowExecutionContext, VariableManager } from '../engine/context.engine';
import { WorkflowDefinition } from '../types';

const prisma = new PrismaClient();
const rollbackEngine = new RollbackEngine();

export const RollbackWorker = async (job: QueueJob, _context: any) => {
  const { executionId } = job.payload.payload;
  if (!executionId) {
    throw new Error('Missing executionId in rollback payload');
  }

  await job.log(`Initializing rollback compensation for execution ${executionId}`);

  const execution = await prisma.workflowExecution.findUnique({ where: { id: executionId } });
  if (!execution) return;

  const version = await prisma.workflowVersion.findUnique({ where: { id: execution.workflowVersionId } });
  if (!version) return;

  const workflow = await prisma.workflow.findUnique({ where: { id: version.workflowId } });
  if (!workflow) return;

  const organization = await prisma.organization.findUnique({ where: { id: execution.organizationId } });
  if (!organization) return;

  const definition: WorkflowDefinition = {
    nodes: JSON.parse(version.nodes),
    edges: JSON.parse(version.connections)
  };

  const variableManager = new VariableManager(execution.organizationId, JSON.parse(execution.state || '{}'));

  const context = new WorkflowExecutionContext({
    workflow,
    version,
    execution,
    organization,
    definition,
    variableManager
  });

  await rollbackEngine.rollbackExecution(context);
  await job.updateProgress(100);
  await job.log('Rollback compensation finished.');
};
