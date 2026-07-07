"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const resend_provider_1 = require("./resend.provider");
const prisma_1 = require("../../../shared/prisma");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class NotificationService {
    emailProvider = new resend_provider_1.ResendProvider();
    async sendContactNotification(submissionId) {
        const submission = await prisma_1.prisma.contactSubmission.findUnique({
            where: { id: submissionId },
            include: { attachments: true }
        });
        if (!submission)
            throw new Error('Submission not found');
        const adminEmail = 'ro224313@gmail.com';
        // 1. Send Admin Notification
        const adminSubject = `📩 New Contact Form Submission: ${submission.subject}`;
        let adminHtml = `
      <h2>New Contact Form Submission</h2>
      <table style="width:100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>ID</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${submission.id}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Name</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${submission.name}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${submission.email}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${submission.phone || 'N/A'}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Company</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${submission.company || 'N/A'}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Subject</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${submission.subject}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>IP Address</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${submission.ipAddress || 'N/A'}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Browser</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${submission.browser || 'N/A'}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Date</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${submission.createdAt.toISOString()}</td></tr>
      </table>
      <br/>
      <h3>Message:</h3>
      <p style="white-space: pre-wrap;">${submission.message}</p>
      <br/>
    `;
        // Process attachments
        const resendAttachments = [];
        const MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024; // 25MB
        let totalSize = 0;
        if (submission.attachments.length > 0) {
            adminHtml += `<h3>Attachments:</h3><ul>`;
            for (const att of submission.attachments) {
                totalSize += att.fileSize;
                const fileUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/v1/contact/files/${att.id}`;
                adminHtml += `<li><a href="${fileUrl}">${att.originalName}</a> (${(att.fileSize / 1024).toFixed(2)} KB)</li>`;
                if (totalSize <= MAX_ATTACHMENT_SIZE) {
                    try {
                        const absolutePath = path_1.default.join(__dirname, '../../../../public', att.path);
                        if (fs_1.default.existsSync(absolutePath)) {
                            const content = fs_1.default.readFileSync(absolutePath);
                            resendAttachments.push({
                                filename: att.originalName,
                                content
                            });
                        }
                    }
                    catch (e) {
                        console.error(`Could not read attachment ${att.originalName}`, e);
                    }
                }
            }
            adminHtml += `</ul>`;
            if (totalSize > MAX_ATTACHMENT_SIZE) {
                adminHtml += `<p><em>Note: Some attachments were not attached directly because they exceeded the email size limit. Use the secure download links above.</em></p>`;
            }
        }
        let adminEmailStatus = 'EMAILED';
        try {
            await this.emailProvider.sendEmail(adminEmail, adminSubject, adminHtml, resendAttachments);
        }
        catch (e) {
            console.error('Failed to send admin notification', e);
            adminEmailStatus = 'FAILED';
        }
        // 2. Send User Confirmation
        const userSubject = `We've received your message`;
        const userHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank you for contacting us.</h2>
        <p>Hi ${submission.name},</p>
        <p>Our team will review your request and respond soon.</p>
        <p><strong>Reference ID:</strong> ${submission.id}</p>
        <br/>
        <p>Best regards,<br/>Nexora AI Team</p>
      </div>
    `;
        try {
            await this.emailProvider.sendEmail(submission.email, userSubject, userHtml);
        }
        catch (e) {
            console.error('Failed to send user confirmation', e);
        }
        // Since Notification model requires a specific org ID and enums that might not exist 
        // globally without org context, we'll store status in ContactSubmission 
        // as it's the safest way to track contact-specific delivery state without polluting core Notification schema.
        await prisma_1.prisma.contactSubmission.update({
            where: { id: submissionId },
            data: { status: adminEmailStatus }
        });
        return { success: true };
    }
}
exports.NotificationService = NotificationService;
