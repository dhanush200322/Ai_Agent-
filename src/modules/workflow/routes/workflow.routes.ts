import { Router } from 'express';
import { WorkflowController } from '../controllers/workflow.controller';
import { authenticate } from '../../../middleware/auth';
import { authorizeWorkflow } from '../middleware/workflow-rbac.middleware';

const router = Router();
const controller = new WorkflowController();

router.use(authenticate);

// Workflows CRUD
router.post('/', authorizeWorkflow('write'), controller.createWorkflow);
router.get('/', authorizeWorkflow('read'), controller.getWorkflows);
router.put('/:id', authorizeWorkflow('write'), controller.updateWorkflow);
router.delete('/:id', authorizeWorkflow('delete'), controller.deleteWorkflow);

// Templates & Executions lists
router.get('/templates', authorizeWorkflow('read'), controller.getTemplates);
router.get('/executions', authorizeWorkflow('read'), controller.getExecutions);

// Version publish, execute, cancel, clone, history, approvals
router.post('/:id/publish', authorizeWorkflow('write'), controller.publishVersion);
router.post('/:id/execute', authorizeWorkflow('execute'), controller.executeWorkflow);
router.post('/:id/cancel', authorizeWorkflow('execute'), controller.cancelExecution);
router.post('/:id/clone', authorizeWorkflow('write'), controller.cloneWorkflow);
router.get('/:id/history', authorizeWorkflow('read'), controller.getWorkflowHistory);
router.post('/:id/approve', authorizeWorkflow('execute'), controller.approveWorkflow);

export default router;
