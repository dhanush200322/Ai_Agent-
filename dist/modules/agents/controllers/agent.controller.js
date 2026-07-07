"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentController = void 0;
const agent_service_1 = require("../services/agent.service");
const storage_service_1 = require("../../../shared/utils/storage.service");
const image_service_1 = require("../../../shared/utils/image.service");
const ApiResponse_1 = require("../../../shared/response/ApiResponse");
class AgentController {
    agentService = new agent_service_1.AgentService();
    getAgents = async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;
        const data = await this.agentService.getAgents(req.user.organizationId, page, limit, search);
        res.status(200).json(ApiResponse_1.ApiResponse.success(data, 'Agents fetched successfully', req.reqId));
    };
    getAgent = async (req, res) => {
        const agent = await this.agentService.getAgent(req.user.organizationId, req.params.id);
        res.status(200).json(ApiResponse_1.ApiResponse.success(agent, 'Agent fetched successfully', req.reqId));
    };
    createAgent = async (req, res) => {
        console.log('REQ_USER', req.user);
        console.log('REQ_BODY', req.body);
        let payload = { ...req.body };
        if (req.file) {
            const baseName = await image_service_1.ImageService.processAvatar(req.file.path);
            payload.avatar = storage_service_1.StorageService.getFileUrl(baseName);
        }
        const agent = await this.agentService.createAgent(req.user.organizationId, req.user.id, payload);
        res.status(201).json(ApiResponse_1.ApiResponse.success(agent, 'Agent created successfully', req.reqId));
    };
    updateAgent = async (req, res) => {
        let payload = { ...req.body };
        if (req.file) {
            const baseName = await image_service_1.ImageService.processAvatar(req.file.path);
            payload.avatar = storage_service_1.StorageService.getFileUrl(baseName);
            // Clean up old avatar if exists
            try {
                const existingAgent = await this.agentService.getAgent(req.user.organizationId, req.params.id);
                if (existingAgent && existingAgent.avatar) {
                    await storage_service_1.StorageService.deleteFile(existingAgent.avatar);
                }
            }
            catch (e) {
                console.error('Failed to cleanup old avatar', e);
            }
        }
        const agent = await this.agentService.updateAgent(req.user.organizationId, req.params.id, payload);
        res.status(200).json(ApiResponse_1.ApiResponse.success(agent, 'Agent updated successfully', req.reqId));
    };
    deleteAgent = async (req, res) => {
        await this.agentService.softDeleteAgent(req.user.organizationId, req.params.id);
        res.status(200).json(ApiResponse_1.ApiResponse.success(null, 'Agent deleted successfully', req.reqId));
    };
    getKnowledgeBases = async (req, res) => {
        const kbs = await this.agentService.getKnowledgeBases(req.user.organizationId, req.params.id);
        res.status(200).json(ApiResponse_1.ApiResponse.success(kbs, 'Knowledge Bases fetched successfully', req.reqId));
    };
    addKnowledgeBases = async (req, res) => {
        const { knowledgeBaseIds } = req.body;
        await this.agentService.addKnowledgeBases(req.user.organizationId, req.params.id, knowledgeBaseIds);
        res.status(200).json(ApiResponse_1.ApiResponse.success(null, 'Knowledge Bases attached successfully', req.reqId));
    };
    removeKnowledgeBase = async (req, res) => {
        await this.agentService.removeKnowledgeBase(req.user.organizationId, req.params.id, req.params.kbId);
        res.status(200).json(ApiResponse_1.ApiResponse.success(null, 'Knowledge Base detached successfully', req.reqId));
    };
}
exports.AgentController = AgentController;
// Trigger restart to clear PermissionCache
