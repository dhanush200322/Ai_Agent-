"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeController = void 0;
const knowledge_service_1 = require("../services/knowledge.service");
const ApiResponse_1 = require("../../../shared/response/ApiResponse");
class KnowledgeController {
    knowledgeService = new knowledge_service_1.KnowledgeService();
    getKnowledgeBases = async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;
        const data = await this.knowledgeService.getKnowledgeBases(req.user.organizationId, page, limit, search);
        res.status(200).json(ApiResponse_1.ApiResponse.success(data, 'Knowledge Bases fetched successfully', req.reqId));
    };
    getKnowledgeBase = async (req, res) => {
        const kb = await this.knowledgeService.getKnowledgeBase(req.user.organizationId, req.params.id);
        res.status(200).json(ApiResponse_1.ApiResponse.success(kb, 'Knowledge Base fetched successfully', req.reqId));
    };
    createKnowledgeBase = async (req, res) => {
        const kb = await this.knowledgeService.createKnowledgeBase(req.user.organizationId, req.user.id, req.body);
        res.status(201).json(ApiResponse_1.ApiResponse.success(kb, 'Knowledge Base created successfully', req.reqId));
    };
    updateKnowledgeBase = async (req, res) => {
        const kb = await this.knowledgeService.updateKnowledgeBase(req.user.organizationId, req.params.id, req.body);
        res.status(200).json(ApiResponse_1.ApiResponse.success(kb, 'Knowledge Base updated successfully', req.reqId));
    };
    deleteKnowledgeBase = async (req, res) => {
        await this.knowledgeService.softDeleteKnowledgeBase(req.user.organizationId, req.params.id);
        res.status(200).json(ApiResponse_1.ApiResponse.success(null, 'Knowledge Base deleted successfully', req.reqId));
    };
    // Source methods
    createSource = async (req, res) => {
        let payload = req.body;
        // Support multipart/form-data where payload is sent as a stringified JSON field `data` or we just take `type` from body
        if (req.file) {
            payload = {
                type: 'bulk',
                data: {
                    file: req.file
                }
            };
        }
        const source = await this.knowledgeService.createSource(req.user.organizationId, req.params.knowledgeBaseId, req.user.id, payload);
        res.status(201).json(ApiResponse_1.ApiResponse.success(source, 'Source ingested successfully', req.reqId));
    };
    // Document methods
    uploadDocument = async (req, res) => {
        console.log("[DEBUG controller] req.file =", req.file);
        console.log("[DEBUG controller] req.body =", req.body);
        console.log("[DEBUG controller] req.params =", req.params);
        if (!req.file) {
            res.status(400).json(ApiResponse_1.ApiResponse.error('File is required', 'Validation Error', req.reqId));
            return;
        }
        const document = await this.knowledgeService.uploadDocument(req.user.organizationId, req.params.knowledgeBaseId, req.user.id, req.file);
        res.status(201).json(ApiResponse_1.ApiResponse.success(document, 'Document uploaded successfully', req.reqId));
    };
    getDocuments = async (req, res) => {
        const documents = await this.knowledgeService.getDocuments(req.user.organizationId, req.params.knowledgeBaseId);
        res.status(200).json(ApiResponse_1.ApiResponse.success(documents, 'Documents fetched successfully', req.reqId));
    };
    getDocument = async (req, res) => {
        const document = await this.knowledgeService.getDocument(req.user.organizationId, req.params.id);
        res.status(200).json(ApiResponse_1.ApiResponse.success(document, 'Document fetched successfully', req.reqId));
    };
    deleteDocument = async (req, res) => {
        await this.knowledgeService.softDeleteDocument(req.user.organizationId, req.params.id);
        res.status(200).json(ApiResponse_1.ApiResponse.success(null, 'Document deleted successfully', req.reqId));
    };
    // Agent Connection methods
    getConnectedAgents = async (req, res) => {
        const agents = await this.knowledgeService.getConnectedAgents(req.user.organizationId, req.params.id);
        res.status(200).json(ApiResponse_1.ApiResponse.success(agents, 'Connected agents fetched successfully', req.reqId));
    };
    addConnectedAgents = async (req, res) => {
        const { agentIds } = req.body;
        await this.knowledgeService.addConnectedAgents(req.user.organizationId, req.params.id, agentIds);
        res.status(200).json(ApiResponse_1.ApiResponse.success(null, 'Agents attached successfully', req.reqId));
    };
    removeConnectedAgent = async (req, res) => {
        await this.knowledgeService.removeConnectedAgent(req.user.organizationId, req.params.id, req.params.agentId);
        res.status(200).json(ApiResponse_1.ApiResponse.success(null, 'Agent detached successfully', req.reqId));
    };
}
exports.KnowledgeController = KnowledgeController;
