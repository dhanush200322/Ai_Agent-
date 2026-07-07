import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { ContactController } from '../controllers/contact.controller';
import { contactUpload } from '../middlewares/contact-upload.middleware';
import { authenticate, authorize } from '../../../middleware/auth';

const router = Router();
const contactController = new ContactController();

// Rate limiter for contact submissions (e.g. max 5 per 15 mins per IP)
const contactSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// Public routes
router.post(
  '/',
  contactSubmitLimiter,
  contactUpload.array('attachments', 10), // Max 10 files
  contactController.submitContact
);

// Secure download for attachments (could require auth depending on business needs)
router.get('/files/:id', contactController.downloadAttachment);

// Admin routes
router.use(authenticate);
router.use(authorize(['ADMIN', 'SUPER_ADMIN']));

router.get('/', contactController.getSubmissions);
router.patch('/:id/status', contactController.updateStatus);
router.delete('/:id', contactController.deleteSubmission);

export default router;
