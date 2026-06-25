"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRuntimeRoutes = void 0;
const express_1 = require("express");
const agent_runtime_controller_1 = require("../controllers/agent-runtime.controller");
const router = (0, express_1.Router)();
const controller = new agent_runtime_controller_1.AgentRuntimeController();
// Basic CRUD and Lifecycle
router.post('/organizations/:organizationId/agents/:agentId/executions', controller.startExecution);
router.post('/executions/:executionId/pause', controller.pauseExecution);
router.post('/executions/:executionId/resume', controller.resumeExecution);
router.post('/executions/:executionId/cancel', controller.cancelExecution);
// Metadata & Registry
router.get('/organizations/:organizationId/agents/:agentId/metadata', controller.getAgentMetadata);
exports.AgentRuntimeRoutes = router;
