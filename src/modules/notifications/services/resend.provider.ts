import { Resend } from 'resend';

export class ResendProvider {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || 're_123');
  }

  async sendEmail(to: string | string[], subject: string, html: string, attachments?: any[]) {
    try {
      const response = await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'Nexora AI <onboarding@resend.dev>',
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        attachments
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Resend sendEmail error:', error);
      throw error;
    }
  }
}
