"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationController = void 0;
const conversation_service_1 = require("../services/conversation.service");
const conversation_message_service_1 = require("../services/conversation-message.service");
const conversationService = new conversation_service_1.ConversationService();
const messageService = new conversation_message_service_1.ConversationMessageService();
class ConversationController {
    createConversation = async (req, res) => {
        try {
            const { sessionId, agentId } = req.body;
            const conversation = await conversationService.createConversation({
                sessionId,
                agentId,
                organizationId: req.user.organizationId,
                userId: req.user.id
            });
            res.status(201).json({ success: true, data: conversation });
        }
        catch (err) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };
    listConversations = async (req, res) => {
        try {
            const skip = parseInt(req.query.skip) || 0;
            const limit = parseInt(req.query.limit) || 20;
            const { agentId, status } = req.query;
            const result = await conversationService.listConversations({
                organizationId: req.user.organizationId,
                userId: req.user.id,
                agentId: agentId,
                status: status,
                skip,
                limit
            });
            res.status(200).json({ success: true, data: result });
        }
        catch (err) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };
    getConversationDetails = async (req, res) => {
        try {
            const conversation = await conversationService.getConversationById(req.params.id, req.user.organizationId);
            res.status(200).json({ success: true, data: conversation });
        }
        catch (err) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };
    deleteConversation = async (req, res) => {
        try {
            await conversationService.deleteConversation(req.params.id, req.user.organizationId);
            res.status(200).json({ success: true, message: 'Conversation deleted' });
        }
        catch (err) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };
    archiveConversation = async (req, res) => {
        try {
            await conversationService.archiveConversation(req.params.id, req.user.organizationId);
            res.status(200).json({ success: true, message: 'Conversation archived' });
        }
        catch (err) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };
    restoreConversation = async (req, res) => {
        try {
            await conversationService.restoreConversation(req.params.id, req.user.organizationId);
            res.status(200).json({ success: true, message: 'Conversation restored' });
        }
        catch (err) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };
    getConversationHistory = async (req, res) => {
        try {
            // Validate they own it
            await conversationService.getConversationById(req.params.conversationId, req.user.organizationId);
            const limit = parseInt(req.query.limit) || 50;
            const skip = parseInt(req.query.skip) || 0;
            const history = await messageService.getHistory(req.params.conversationId, limit, skip);
            res.status(200).json({ success: true, data: history });
        }
        catch (err) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };
}
exports.ConversationController = ConversationController;
