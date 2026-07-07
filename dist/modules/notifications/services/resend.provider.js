"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendProvider = void 0;
const resend_1 = require("resend");
class ResendProvider {
    resend;
    constructor() {
        this.resend = new resend_1.Resend(process.env.RESEND_API_KEY || 're_123');
    }
    async sendEmail(to, subject, html, attachments, replyTo) {
        try {
            const response = await this.resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || 'Nexora AI <onboarding@resend.dev>',
                to: Array.isArray(to) ? to : [to],
                subject,
                html,
                attachments,
                replyTo: replyTo
            });
            if (response.error) {
                throw new Error(response.error.message);
            }
            return { success: true, data: response.data };
        }
        catch (error) {
            console.error('Resend sendEmail error:', error);
            throw error;
        }
    }
}
exports.ResendProvider = ResendProvider;
