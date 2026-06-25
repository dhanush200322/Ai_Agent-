"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const workflow_controller_1 = require("../controllers/workflow.controller");
const auth_1 = require("../../../middleware/auth");
const workflow_rbac_middleware_1 = require("../middleware/workflow-rbac.middleware");
const router = (0, express_1.Router)();
const controller = new workflow_controller_1.WorkflowController();
router.use(auth_1.authenticate);
// Workflows CRUD
router.post('/', (0, workflow_rbac_middleware_1.authorizeWorkflow)('write'), controller.createWorkflow);
router.get('/', (0, workflow_rbac_middleware_1.authorizeWorkflow)('read'), controller.getWorkflows);
router.put('/:id', (0, workflow_rbac_middleware_1.authorizeWorkflow)('write'), controller.updateWorkflow);
router.delete('/:id', (0, workflow_rbac_middleware_1.authorizeWorkflow)('delete'), controller.deleteWorkflow);
// Templates & Executions lists
router.get('/templates', (0, workflow_rbac_middleware_1.authorizeWorkflow)('read'), controller.getTemplates);
router.get('/executions', (0, workflow_rbac_middleware_1.authorizeWorkflow)('read'), controller.getExecutions);
// Version publish, execute, cancel, clone, history, approvals
router.post('/:id/publish', (0, workflow_rbac_middleware_1.authorizeWorkflow)('write'), controller.publishVersion);
router.post('/:id/execute', (0, workflow_rbac_middleware_1.authorizeWorkflow)('execute'), controller.executeWorkflow);
router.post('/:id/cancel', (0, workflow_rbac_middleware_1.authorizeWorkflow)('execute'), controller.cancelExecution);
router.post('/:id/clone', (0, workflow_rbac_middleware_1.authorizeWorkflow)('write'), controller.cloneWorkflow);
router.get('/:id/history', (0, workflow_rbac_middleware_1.authorizeWorkflow)('read'), controller.getWorkflowHistory);
router.post('/:id/approve', (0, workflow_rbac_middleware_1.authorizeWorkflow)('execute'), controller.approveWorkflow);
exports.default = router;
