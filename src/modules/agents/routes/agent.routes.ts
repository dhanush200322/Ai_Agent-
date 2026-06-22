import { Router } from 'express';
import { AgentController } from '../controllers/agent.controller';
import { authenticate } from '../../../middleware/auth';
import { authorize } from '../../../middleware/authorize';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { validate } from '../../../middleware/validate';
import { upload } from '../../../shared/utils/storage.service';
import { createAgentSchema, updateAgentSchema } from '../validators/agent.validator';

const router = Router();
const agentController = new AgentController();

router.use(authenticate);

router.get('/', authorize('agent:view'), asyncHandler(agentController.getAgents));
router.get('/:id', authorize('agent:view'), asyncHandler(agentController.getAgent));

router.post('/', authorize('agent:create'), upload.single('avatar'), validate(createAgentSchema), asyncHandler(agentController.createAgent));
router.patch('/:id', authorize('agent:update'), upload.single('avatar'), validate(updateAgentSchema), asyncHandler(agentController.updateAgent));
router.delete('/:id', authorize('agent:delete'), asyncHandler(agentController.deleteAgent));

export default router;
