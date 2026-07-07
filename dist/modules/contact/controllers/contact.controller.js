"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactController = void 0;
const contact_service_1 = require("../services/contact.service");
const notification_service_1 = require("../../notifications/services/notification.service");
const contact_validator_1 = require("../validators/contact.validator");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class ContactController {
    contactService = new contact_service_1.ContactService();
    notificationService = new notification_service_1.NotificationService();
    submitContact = async (req, res) => {
        try {
            // Validate honeypot
            if (req.body.honeypot) {
                return res.status(200).json({ success: true, message: 'Submission received.' }); // silently ignore bot
            }
            // Validate schema
            const validationResult = contact_validator_1.contactSubmissionSchema.safeParse({ body: req.body });
            if (!validationResult.success) {
                return res.status(400).json({ error: 'Validation failed', details: validationResult.error.issues });
            }
            const files = req.files;
            const data = {
                ...req.body,
                ipAddress: req.ip || req.socket.remoteAddress,
                browser: req.headers['user-agent']
            };
            const submission = await this.contactService.createSubmission(data, files);
            // Async send email without blocking the response
            this.notificationService.sendContactNotification(submission.id).catch(err => {
                console.error('Background email task failed:', err);
            });
            return res.status(201).json({
                success: true,
                message: 'Your message has been received successfully. We will contact you shortly.',
                data: { id: submission.id }
            });
        }
        catch (error) {
            console.error('ContactController submitContact error:', error);
            return res.status(500).json({ error: 'An unexpected error occurred.' });
        }
    };
    getSubmissions = async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search;
            const result = await this.contactService.getSubmissions(page, limit, search);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(500).json({ error: 'An unexpected error occurred.' });
        }
    };
    updateStatus = async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const updated = await this.contactService.updateStatus(id, status);
            return res.status(200).json(updated);
        }
        catch (error) {
            return res.status(500).json({ error: 'An unexpected error occurred.' });
        }
    };
    deleteSubmission = async (req, res) => {
        try {
            const { id } = req.params;
            await this.contactService.deleteSubmission(id);
            return res.status(200).json({ success: true });
        }
        catch (error) {
            return res.status(500).json({ error: 'An unexpected error occurred.' });
        }
    };
    downloadAttachment = async (req, res) => {
        try {
            const { id } = req.params;
            // In a real scenario, you'd fetch attachment by ID from DB to get the path
            // But for speed, let's assume we fetch it via service or prisma directly here:
            const { prisma } = require('../../../shared/prisma');
            const attachment = await prisma.contactAttachment.findUnique({ where: { id } });
            if (!attachment) {
                return res.status(404).json({ error: 'Attachment not found' });
            }
            const filePath = path_1.default.join(__dirname, '../../../../public', attachment.path);
            if (!fs_1.default.existsSync(filePath)) {
                return res.status(404).json({ error: 'File not found on disk' });
            }
            res.download(filePath, attachment.originalName);
            return;
        }
        catch (error) {
            return res.status(500).json({ error: 'An unexpected error occurred.' });
        }
    };
}
exports.ContactController = ContactController;
