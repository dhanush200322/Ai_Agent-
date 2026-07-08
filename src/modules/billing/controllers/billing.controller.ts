import { prisma } from '../../../shared/prisma';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { SubscriptionEngine } from '../engine/subscription.engine';
import { StripeProvider } from '../providers/stripe.provider';
import { QueueManager } from '../../queue/engine/queue-manager';
import { BullMQProvider } from '../../queue/providers/bullmq.provider';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { EmailService } from '../services/email.service';

export class BillingController {
  private subscriptionEngine = new SubscriptionEngine();
  private stripeProvider = new StripeProvider();
  private queueManager = new QueueManager(new BullMQProvider());
  private emailService = new EmailService();

  async getPlans(_req: Request, res: Response) {
    const plans = await prisma.subscriptionPlan.findMany({ where: { active: true } });
    res.json(plans);
  }

  async getSubscription(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const sub = await prisma.organizationSubscription.findUnique({
      where: { organizationId },
      include: { plan: true }
    });
    res.json(sub);
  }

  async subscribe(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const { planId } = req.body;
    try {
      const sub = await this.subscriptionEngine.subscribe(organizationId, planId);
      res.json(sub);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  async cancel(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const sub = await this.subscriptionEngine.cancel(organizationId);
    res.json(sub);
  }

  // --- Razorpay Integration ---

  async createRazorpayOrder(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const { plan, billingCycle } = req.body;

    try {
      let amountInINR = 0;
      if (plan === 'professional') {
        amountInINR = billingCycle === 'annual' ? 9990 : 999;
      } else {
        res.status(400).json({ error: 'Invalid plan selected.' });
        return;
      }

      const amountInPaise = amountInINR * 100;

      const keyId = (process.env.RAZORPAY_KEY_ID || process.env['R A Z O R P A Y _ K E Y _ I D'] || '').replace(/\s+/g, '');
      const keySecret = (process.env.RAZORPAY_KEY_SECRET || process.env[' R A Z O R P A Y _ K E Y _ S E C R E T '] || '').replace(/\s+/g, '');

      if (!keyId || !keySecret) {
        throw new Error('Razorpay keys are missing or invalid.');
      }

      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret
      });

      const orderOptions = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${organizationId.substring(0,8)}_${Date.now()}`
      };

      const order = await razorpay.orders.create(orderOptions);

      res.json({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency
      });
    } catch (error: any) {
      console.error('Error creating Razorpay order:', error);
      res.status(500).json({ error: error.message || 'Failed to create payment order.' });
    }
  }

  async verifyRazorpayPayment(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const userId = req.user!.id;
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, plan, billingCycle } = req.body;

    try {
      const secret = (process.env.RAZORPAY_KEY_SECRET || process.env[' R A Z O R P A Y _ K E Y _ S E C R E T '] || '').replace(/\s+/g, '');
      if (!secret) {
        throw new Error('Razorpay secret is missing.');
      }
      
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        res.status(400).json({ error: 'Invalid payment signature.' });
        return;
      }

      const existingPayment = await prisma.payment.findUnique({
        where: { providerPaymentId: razorpay_payment_id }
      });
      if (existingPayment) {
        res.status(400).json({ error: 'Duplicate payment.' });
        return;
      }

      const subscriptionPlan = await prisma.subscriptionPlan.findFirst({
        where: { name: { equals: plan, mode: 'insensitive' } }
      });
      
      if (!subscriptionPlan) {
        res.status(400).json({ error: 'Plan not found.' });
        return;
      }

      const planId = subscriptionPlan.id;
      let amountInINR = plan === 'professional' ? (billingCycle === 'annual' ? 9990 : 999) : 0;

      const orgSub = await prisma.$transaction(async (tx) => {
        const renewalDate = billingCycle === 'annual' 
            ? new Date(new Date().setFullYear(new Date().getFullYear() + 1)) 
            : new Date(new Date().setMonth(new Date().getMonth() + 1));

        const sub = await tx.organizationSubscription.upsert({
          where: { organizationId },
          update: {
            userId: userId,
            status: 'ACTIVE',
            billingCycle: billingCycle,
            paymentProvider: 'RAZORPAY',
            startDate: new Date(),
            renewalDate: renewalDate,
            expiryDate: renewalDate,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            amount: amountInINR,
            currency: 'INR'
          },
          create: {
            userId: userId,
            organizationId,
            planId: planId,
            billingCycle: billingCycle,
            status: 'ACTIVE',
            paymentProvider: 'RAZORPAY',
            startDate: new Date(),
            renewalDate: renewalDate,
            expiryDate: renewalDate,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            amount: amountInINR,
            currency: 'INR'
          }
        });
        
        const invoice = await tx.invoice.create({
          data: {
            organizationId,
            invoiceNumber: `INV-${Date.now()}`,
            subtotal: amountInINR,
            tax: 0,
            total: amountInINR,
            status: 'PAID',
            paidAt: new Date()
          }
        });
        
        await tx.payment.create({
          data: {
            invoiceId: invoice.id,
            provider: 'RAZORPAY',
            providerPaymentId: razorpay_payment_id,
            currency: 'INR',
            amount: amountInINR,
            status: 'COMPLETED',
            orderId: razorpay_order_id,
            paymentMethod: 'razorpay',
            purchaseDate: new Date()
          }
        });

        // Reactivate any INACTIVE agents upon successful renewal/upgrade
        await tx.agent.updateMany({
          where: { organizationId, status: 'INACTIVE', deletedAt: null },
          data: { status: 'ACTIVE' }
        });

        return sub;
      });

      res.json({ success: true, subscription: orgSub });

      // Asynchronously send confirmation email without blocking the response
      if (req.user?.email && orgSub.renewalDate) {
        this.emailService.sendSubscriptionConfirmationEmail(
          req.user.email,
          req.user.firstName || 'User',
          plan,
          billingCycle,
          new Date(),
          orgSub.renewalDate,
          amountInINR,
          razorpay_payment_id,
          razorpay_order_id
        ).catch(e => console.error("Async email send failed:", e));
      }
    } catch (error: any) {
      console.error('Error verifying Razorpay payment:', error);
      res.status(500).json({ error: 'Failed to verify payment.' });
    }
  }

  // --- End Razorpay Integration ---

  async getPaymentHistory(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    try {
      const payments = await prisma.payment.findMany({
        where: { invoice: { organizationId } },
        include: { invoice: true },
        orderBy: { purchaseDate: 'desc' }
      });
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch payment history' });
    }
  }

  async renew(req: Request, res: Response) {
    res.json({ success: true, message: 'Use create-razorpay-order to renew' });
  }

  async razorpayWebhook(req: Request, res: Response) {
    const secret = (process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || process.env[' R A Z O R P A Y _ K E Y _ S E C R E T '] || '').replace(/\s+/g, '');
    const signature = req.headers['x-razorpay-signature'] as string;
    
    try {
      if (!secret) throw new Error('Razorpay webhook secret is missing.');
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (generatedSignature !== signature) {
        res.status(400).json({ error: 'Invalid webhook signature' });
        return;
      }

      const event = req.body;
      
      const webhookEvent = await prisma.billingWebhookEvent.create({
        data: {
          provider: 'RAZORPAY',
          providerEventId: event.id || `evt_${Date.now()}`,
          eventType: event.event || 'unknown',
          payload: JSON.stringify(event)
        }
      });

      res.status(200).send('OK');
    } catch (err: any) {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  async webhook(req: Request, res: Response) {
    const signature = req.headers['stripe-signature'] as string;
    const rawBody = (req as any).rawBody; 
    
    try {
      const event = this.stripeProvider.verifyWebhook(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_123');
      
      const webhookEvent = await prisma.billingWebhookEvent.create({
        data: {
          provider: 'STRIPE',
          providerEventId: event.id,
          eventType: event.type,
          payload: JSON.stringify(event)
        }
      });

      await this.queueManager.enqueue({
        queueName: 'billing.webhooks',
        type: 'WEBHOOK',
        payload: {
          id: webhookEvent.id,
          organizationId: 'SYSTEM',
          correlationId: webhookEvent.id,
          traceId: webhookEvent.id,
          priority: 'HIGH',
          retries: 3,
          payload: { webhookEventId: webhookEvent.id },
          metadata: {},
          createdAt: new Date()
        },
        priority: 'HIGH'
      });

      res.status(200).send('OK');
    } catch (err: any) {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
}
