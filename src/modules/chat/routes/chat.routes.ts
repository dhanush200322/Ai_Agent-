import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { validateChatCompletion } from '../validators/chat.validator';
import { authenticate } from '../../../middleware/auth';
import { authorize } from '../../../middleware/authorize';

import { ConversationController } from '../controllers/conversation.controller';

const router = Router();
const chatController = new ChatController();
const conversationController = new ConversationController();

// Chat Completions
router.post(
  '/completions',
  authenticate,
  authorize('agent:view'), // Ensure RBAC allows chat
  validateChatCompletion,
  chatController.streamChatCompletion
);

// Conversations
router.post('/conversations', authenticate, authorize('agent:view'), conversationController.createConversation);
router.get('/conversations', authenticate, authorize('agent:view'), conversationController.listConversations);
router.get('/conversations/:id', authenticate, authorize('agent:view'), conversationController.getConversationDetails);
router.delete('/conversations/:id', authenticate, authorize('agent:view'), conversationController.deleteConversation);
router.post('/conversations/:id/archive', authenticate, authorize('agent:view'), conversationController.archiveConversation);
router.post('/conversations/:id/restore', authenticate, authorize('agent:view'), conversationController.restoreConversation);

// Messages History
router.get('/messages/:conversationId', authenticate, authorize('agent:view'), conversationController.getConversationHistory);

// Public Widget Routes
router.get('/widget/agents/:agentId', conversationController.getWidgetAgent);
router.post('/widget/conversations', conversationController.createWidgetConversation);
router.post('/widget/completions', chatController.streamWidgetChatCompletion);

export default router;
