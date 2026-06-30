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
  authorize('chat:create'), // Ensure RBAC allows chat
  validateChatCompletion,
  chatController.streamChatCompletion
);

// Conversations
router.post('/conversations', authenticate, authorize('chat:create'), conversationController.createConversation);
router.get('/conversations', authenticate, authorize('chat:read'), conversationController.listConversations);
router.get('/conversations/:id', authenticate, authorize('chat:read'), conversationController.getConversationDetails);
router.delete('/conversations/:id', authenticate, authorize('chat:delete'), conversationController.deleteConversation);
router.post('/conversations/:id/archive', authenticate, authorize('chat:update'), conversationController.archiveConversation);
router.post('/conversations/:id/restore', authenticate, authorize('chat:update'), conversationController.restoreConversation);

// Messages History
router.get('/messages/:conversationId', authenticate, authorize('chat:read'), conversationController.getConversationHistory);

// Public Widget Routes
router.post('/widget/conversations', conversationController.createWidgetConversation);
router.post('/widget/completions', chatController.streamWidgetChatCompletion);

export default router;
