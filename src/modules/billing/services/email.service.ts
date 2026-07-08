import { Resend } from 'resend';

export class EmailService {
  private resend: Resend;
  private fromEmail: string;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || 're_test_key');
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'ro224313@gmail.com';
  }

  async sendReminderEmail(to: string, userName: string, daysLeft: number, isAnnual: boolean) {
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

      Nexora AI Team
    `;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html: body.replace(/\n/g, '<br>')
      });
      console.log(`Sent ${daysLeft}-day reminder email to ${to}`);
    } catch (error) {
      console.error('Failed to send reminder email:', error);
    }
  }

  async sendSubscriptionConfirmationEmail(
    to: string,
    userName: string,
    planName: string,
    billingCycle: string,
    purchaseDate: Date,
    expiryDate: Date,
    amount: number,
    paymentId: string,
    orderId: string
  ) {
    const isAnnual = billingCycle.toLowerCase() === 'annual';
    const subject = isAnnual 
      ? `🎉 Welcome to Enterprise AI Professional – Annual Plan Activated`
      : `🎉 Welcome to Enterprise AI Professional – Monthly Plan Activated`;

    const formattedPurchaseDate = purchaseDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedExpiryDate = expiryDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    const frontendUrl = process.env.FRONTEND_URL || 'https://ai-agent-pohw.vercel.app';

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #000; padding: 20px; text-align: center;">
          <h2 style="color: #D4AF37; margin: 0;">Enterprise AI</h2>
        </div>
        <div style="padding: 30px;">
          <h3 style="margin-top: 0;">Hello ${userName},</h3>
          <p>Thank you for choosing Enterprise AI Professional.</p>
          <div style="background-color: #f6fdf9; border-left: 4px solid #10b981; padding: 10px 15px; margin: 20px 0;">
            <strong>Your payment has been successfully received and your subscription has been activated.</strong>
          </div>
          
          <h4 style="border-bottom: 1px solid #eaeaea; padding-bottom: 8px; margin-bottom: 15px;">Subscription Details</h4>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 8px 0; color: #666;">Plan:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${planName}</td></tr>
            <tr><td style="padding: 8px 0; color: #666; border-top: 1px solid #eaeaea;">Billing Cycle:</td><td style="padding: 8px 0; font-weight: bold; text-align: right; border-top: 1px solid #eaeaea;">${billingCycle}</td></tr>
            <tr><td style="padding: 8px 0; color: #666; border-top: 1px solid #eaeaea;">Status:</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #10b981; border-top: 1px solid #eaeaea;">ACTIVE</td></tr>
            <tr><td style="padding: 8px 0; color: #666; border-top: 1px solid #eaeaea;">Purchase Date:</td><td style="padding: 8px 0; text-align: right; border-top: 1px solid #eaeaea;">${formattedPurchaseDate}</td></tr>
            <tr><td style="padding: 8px 0; color: #666; border-top: 1px solid #eaeaea;">Expiry Date:</td><td style="padding: 8px 0; text-align: right; border-top: 1px solid #eaeaea;">${formattedExpiryDate}</td></tr>
            <tr><td style="padding: 8px 0; color: #666; border-top: 1px solid #eaeaea;">Amount Paid:</td><td style="padding: 8px 0; font-weight: bold; text-align: right; border-top: 1px solid #eaeaea;">₹${amount}</td></tr>
            <tr><td style="padding: 8px 0; color: #666; border-top: 1px solid #eaeaea;">Payment ID:</td><td style="padding: 8px 0; text-align: right; border-top: 1px solid #eaeaea; font-family: monospace;">${paymentId}</td></tr>
            <tr><td style="padding: 8px 0; color: #666; border-top: 1px solid #eaeaea;">Order ID:</td><td style="padding: 8px 0; text-align: right; border-top: 1px solid #eaeaea; font-family: monospace;">${orderId}</td></tr>
          </table>

          <h4>You now have access to:</h4>
          <ul style="list-style: none; padding: 0;">
            <li style="margin-bottom: 8px;">✓ Unlimited AI Agents</li>
            <li style="margin-bottom: 8px;">✓ Premium AI Models</li>
            <li style="margin-bottom: 8px;">✓ Advanced Knowledge Base</li>
            <li style="margin-bottom: 8px;">✓ Integrations</li>
            <li style="margin-bottom: 8px;">✓ Priority Support</li>
            <li style="margin-bottom: 8px;">✓ Future Premium Features</li>
          </ul>

          <p style="margin-top: 30px;">You can manage your subscription anytime from your Billing Dashboard.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${frontendUrl}/dashboard" style="background-color: #D4AF37; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Go To Dashboard</a>
          </div>
          
          <p style="color: #666; font-size: 14px;">Thank you for choosing Enterprise AI.</p>
          <p style="color: #666; font-size: 14px; margin-top: 5px;"><strong>Enterprise AI Team</strong></p>
        </div>
      </div>
    `;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html: htmlBody
      });
      console.log('Subscription confirmation email sent');
    } catch (error) {
      console.error('Failed to send subscription confirmation email:', error);
    }
  }
}
