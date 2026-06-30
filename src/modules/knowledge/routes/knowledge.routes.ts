import { Router } from 'express';
import { KnowledgeController } from '../controllers/knowledge.controller';
import { authenticate } from '../../../middleware/auth';
import { authorize } from '../../../middleware/authorize';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { validate } from '../../../middleware/validate';
import { createKnowledgeBaseSchema, updateKnowledgeBaseSchema, documentParamsSchema } from '../validators/knowledge.validator';
import { documentUpload } from '../middlewares/document-upload.middleware';

const router = Router();
const knowledgeController = new KnowledgeController();

router.use(authenticate);

router.get('/', authorize('knowledge:view'), asyncHandler(knowledgeController.getKnowledgeBases));
router.get('/:id', authorize('knowledge:view'), asyncHandler(knowledgeController.getKnowledgeBase));

router.post('/', authorize('knowledge:create'), validate(createKnowledgeBaseSchema), asyncHandler(knowledgeController.createKnowledgeBase));
router.patch('/:id', authorize('knowledge:update'), validate(updateKnowledgeBaseSchema), asyncHandler(knowledgeController.updateKnowledgeBase));
router.delete('/:id', authorize('knowledge:delete'), asyncHandler(knowledgeController.deleteKnowledgeBase));

// Source routes
router.post('/:knowledgeBaseId/sources',
  authorize('knowledge:create'),
  documentUpload.single('file'), // allow file upload for bulk imports
  validate(documentParamsSchema),
  asyncHandler(knowledgeController.createSource)
);

// Document routes
router.post('/:knowledgeBaseId/documents', 
  authorize('knowledge:create'),
  (req, _res, next) => {
    console.log("UPLOAD ROUTE VERSION 6.2");
    console.log("BEFORE MULTER");
    console.log(req.headers);
    console.log("CONTENT TYPE:", req.headers["content-type"]);
    console.log(documentUpload);
    next();
  },
  documentUpload.single('file'), 
  (req, _res, next) => {
    console.log("AFTER MULTER");
    console.log(req.file);
    console.log(req.body);
    next();
  },
  validate(documentParamsSchema), 
  asyncHandler(knowledgeController.uploadDocument)
);
router.get('/:knowledgeBaseId/documents', authorize('knowledge:view'), validate(documentParamsSchema), asyncHandler(knowledgeController.getDocuments));
router.get('/documents/:id', authorize('knowledge:view'), validate(documentParamsSchema), asyncHandler(knowledgeController.getDocument));
router.delete('/documents/:id', authorize('knowledge:delete'), validate(documentParamsSchema), asyncHandler(knowledgeController.deleteDocument));

// Agent connection routes
router.get('/:id/agents', authorize('knowledge:view'), asyncHandler(knowledgeController.getConnectedAgents));
router.post('/:id/agents', authorize('knowledge:update'), asyncHandler(knowledgeController.addConnectedAgents));
router.delete('/:id/agents/:agentId', authorize('knowledge:update'), asyncHandler(knowledgeController.removeConnectedAgent));

export default router;


