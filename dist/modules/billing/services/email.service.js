"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const resend_1 = require("resend");
class EmailService {
    resend;
    fromEmail;
    constructor() {
        this.resend = new resend_1.Resend(process.env.RESEND_API_KEY || 're_test_key');
        this.fromEmail = process.env.RESEND_FROM_EMAIL || 'ro224313@gmail.com';
    }
    async sendReminderEmail(to, userName, daysLeft, isAnnual) {
        const subject = isAnnual
            ? `Your Professional Annual Plan expires in ${daysLeft} days`
            : `Your Professional Plan expires in ${daysLeft} days`;
        const body = `
      Hello ${userName},

      Your Professional ${isAnnual ? 'Annual' : 'Monthly'} subscription will expire in ${daysLeft} days.

      Renew now to continue using:
      • Unlimited AI Agents
      • Premium AI Models
      • Advanced Knowledge Base
      • API Access
      • Priority Support

      If your subscription is not renewed, your account will automatically become a Starter Plan.
      Only one AI Agent will remain active.
      
      Renew today to avoid interruption.

      Enterprise AI Team
    `;
        try {
            await this.resend.emails.send({
                from: this.fromEmail,
                to,
                subject,
                html: body.replace(/\n/g, '<br>')
            });
            console.log(`Sent ${daysLeft}-day reminder email to ${to}`);
        }
        catch (error) {
            console.error('Failed to send reminder email:', error);
        }
    }
}
exports.EmailService = EmailService;
