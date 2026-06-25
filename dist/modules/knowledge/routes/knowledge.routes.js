"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const knowledge_controller_1 = require("../controllers/knowledge.controller");
const auth_1 = require("../../../middleware/auth");
const authorize_1 = require("../../../middleware/authorize");
const asyncHandler_1 = require("../../../shared/utils/asyncHandler");
const validate_1 = require("../../../middleware/validate");
const knowledge_validator_1 = require("../validators/knowledge.validator");
const document_upload_middleware_1 = require("../middlewares/document-upload.middleware");
const router = (0, express_1.Router)();
const knowledgeController = new knowledge_controller_1.KnowledgeController();
router.use(auth_1.authenticate);
router.get('/', (0, authorize_1.authorize)('knowledge:view'), (0, asyncHandler_1.asyncHandler)(knowledgeController.getKnowledgeBases));
router.get('/:id', (0, authorize_1.authorize)('knowledge:view'), (0, asyncHandler_1.asyncHandler)(knowledgeController.getKnowledgeBase));
router.post('/', (0, authorize_1.authorize)('knowledge:create'), (0, validate_1.validate)(knowledge_validator_1.createKnowledgeBaseSchema), (0, asyncHandler_1.asyncHandler)(knowledgeController.createKnowledgeBase));
router.patch('/:id', (0, authorize_1.authorize)('knowledge:update'), (0, validate_1.validate)(knowledge_validator_1.updateKnowledgeBaseSchema), (0, asyncHandler_1.asyncHandler)(knowledgeController.updateKnowledgeBase));
router.delete('/:id', (0, authorize_1.authorize)('knowledge:delete'), (0, asyncHandler_1.asyncHandler)(knowledgeController.deleteKnowledgeBase));
// Document routes
router.post('/:knowledgeBaseId/documents', (0, authorize_1.authorize)('knowledge:create'), (req, _res, next) => {
    console.log("UPLOAD ROUTE VERSION 6.2");
    console.log("BEFORE MULTER");
    console.log(req.headers);
    console.log("CONTENT TYPE:", req.headers["content-type"]);
    console.log(document_upload_middleware_1.documentUpload);
    next();
}, document_upload_middleware_1.documentUpload.single('file'), (req, _res, next) => {
    console.log("AFTER MULTER");
    console.log(req.file);
    console.log(req.body);
    next();
}, (0, validate_1.validate)(knowledge_validator_1.documentParamsSchema), (0, asyncHandler_1.asyncHandler)(knowledgeController.uploadDocument));
router.get('/:knowledgeBaseId/documents', (0, authorize_1.authorize)('knowledge:view'), (0, validate_1.validate)(knowledge_validator_1.documentParamsSchema), (0, asyncHandler_1.asyncHandler)(knowledgeController.getDocuments));
router.get('/documents/:id', (0, authorize_1.authorize)('knowledge:view'), (0, validate_1.validate)(knowledge_validator_1.documentParamsSchema), (0, asyncHandler_1.asyncHandler)(knowledgeController.getDocument));
router.delete('/documents/:id', (0, authorize_1.authorize)('knowledge:delete'), (0, validate_1.validate)(knowledge_validator_1.documentParamsSchema), (0, asyncHandler_1.asyncHandler)(knowledgeController.deleteDocument));
exports.default = router;
