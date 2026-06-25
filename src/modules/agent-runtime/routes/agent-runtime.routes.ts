import { Router } from 'express';
import { AgentRuntimeController } from '../controllers/agent-runtime.controller';

const router = Router();
const controller = new AgentRuntimeController();

// Basic CRUD and Lifecycle
router.post('/organizations/:organizationId/agents/:agentId/executions', controller.startExecution);
router.post('/executions/:executionId/pause', controller.pauseExecution);
router.post('/executions/:executionId/resume', controller.resumeExecution);
router.post('/executions/:executionId/cancel', controller.cancelExecution);

// Metadata & Registry
router.get('/organizations/:organizationId/agents/:agentId/metadata', controller.getAgentMetadata);

export const AgentRuntimeRoutes = router;
