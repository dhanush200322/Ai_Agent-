"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RollbackWorker = void 0;
const rollback_engine_1 = require("../engine/rollback.engine");
const client_1 = require("@prisma/client");
const context_engine_1 = require("../engine/context.engine");
const prisma = new client_1.PrismaClient();
const rollbackEngine = new rollback_engine_1.RollbackEngine();
const RollbackWorker = async (job, _context) => {
    const { executionId } = job.payload.payload;
    if (!executionId) {
        throw new Error('Missing executionId in rollback payload');
    }
    await job.log(`Initializing rollback compensation for execution ${executionId}`);
    const execution = await prisma.workflowExecution.findUnique({ where: { id: executionId } });
    if (!execution)
        return;
    const version = await prisma.workflowVersion.findUnique({ where: { id: execution.workflowVersionId } });
    if (!version)
        return;
    const workflow = await prisma.workflow.findUnique({ where: { id: version.workflowId } });
    if (!workflow)
        return;
    const organization = await prisma.organization.findUnique({ where: { id: execution.organizationId } });
    if (!organization)
        return;
    const definition = {
        nodes: JSON.parse(version.nodes),
        edges: JSON.parse(version.connections)
    };
    const variableManager = new context_engine_1.VariableManager(execution.organizationId, JSON.parse(execution.state || '{}'));
    const context = new context_engine_1.WorkflowExecutionContext({
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
exports.RollbackWorker = RollbackWorker;
