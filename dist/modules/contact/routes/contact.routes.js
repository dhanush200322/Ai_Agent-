"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const contact_controller_1 = require("../controllers/contact.controller");
const contact_upload_middleware_1 = require("../middlewares/contact-upload.middleware");
const auth_1 = require("../../../middleware/auth");
const router = (0, express_1.Router)();
const contactController = new contact_controller_1.ContactController();
// Rate limiter for contact submissions (e.g. max 5 per 15 mins per IP)
const contactSubmitLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});
// Public routes
router.post('/', contactSubmitLimiter, contact_upload_middleware_1.contactUpload.array('attachments', 10), // Max 10 files
contactController.submitContact);
// Secure download for attachments (could require auth depending on business needs)
router.get('/files/:id', contactController.downloadAttachment);
// Admin routes
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)(['ADMIN', 'SUPER_ADMIN']));
router.get('/', contactController.getSubmissions);
router.patch('/:id/status', contactController.updateStatus);
router.delete('/:id', contactController.deleteSubmission);
exports.default = router;
