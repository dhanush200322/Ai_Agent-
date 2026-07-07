"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = require("../controllers/chat.controller");
const chat_validator_1 = require("../validators/chat.validator");
const auth_1 = require("../../../middleware/auth");
const authorize_1 = require("../../../middleware/authorize");
const conversation_controller_1 = require("../controllers/conversation.controller");
const router = (0, express_1.Router)();
const chatController = new chat_controller_1.ChatController();
const conversationController = new conversation_controller_1.ConversationController();
// Chat Completions
router.post('/completions', auth_1.authenticate, (0, authorize_1.authorize)('agent:view'), // Ensure RBAC allows chat
chat_validator_1.validateChatCompletion, chatController.streamChatCompletion);
// Conversations
router.post('/conversations', auth_1.authenticate, (0, authorize_1.authorize)('agent:view'), conversationController.createConversation);
router.get('/conversations', auth_1.authenticate, (0, authorize_1.authorize)('agent:view'), conversationController.listConversations);
router.get('/conversations/:id', auth_1.authenticate, (0, authorize_1.authorize)('agent:view'), conversationController.getConversationDetails);
router.delete('/conversations/:id', auth_1.authenticate, (0, authorize_1.authorize)('agent:view'), conversationController.deleteConversation);
router.post('/conversations/:id/archive', auth_1.authenticate, (0, authorize_1.authorize)('agent:view'), conversationController.archiveConversation);
router.post('/conversations/:id/restore', auth_1.authenticate, (0, authorize_1.authorize)('agent:view'), conversationController.restoreConversation);
// Messages History
router.get('/messages/:conversationId', auth_1.authenticate, (0, authorize_1.authorize)('agent:view'), conversationController.getConversationHistory);
// Public Widget Routes
router.get('/widget/agents/:agentId', conversationController.getWidgetAgent);
router.post('/widget/conversations', conversationController.createWidgetConversation);
router.post('/widget/completions', chatController.streamWidgetChatCompletion);
exports.default = router;
