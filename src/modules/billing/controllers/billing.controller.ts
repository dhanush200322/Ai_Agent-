import { prisma } from '../../../shared/prisma';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { SubscriptionEngine } from '../engine/subscription.engine';
import { StripeProvider } from '../providers/stripe.provider';
import { QueueManager } from '../../queue/engine/queue-manager';
import { BullMQProvider } from '../../queue/providers/bullmq.provider';
import Razorpay from 'razorpay';
import crypto from 'crypto';

export class BillingController {
  private subscriptionEngine = new SubscriptionEngine();
  private stripeProvider = new StripeProvider();
  private queueManager = new QueueManager(new BullMQProvider());

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
    const { plan, billingCycle } = req.body; // e.g. plan: "professional", billingCycle: "monthly"

    try {
      // Determine amount based on plan and billingCycle
      let amountInINR = 0;
      if (plan === 'professional') {
        amountInINR = billingCycle === 'annual' ? 9990 : 999;
      } else {
        res.status(400).json({ error: 'Invalid plan selected.' });
        return;
      }

      // Razorpay expects amount in paise (1 INR = 100 paise)
      const amountInPaise = amountInINR * 100;

      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!
      });

      const orderOptions = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_org_${organizationId}_${Date.now()}`
      };

      const order = await razorpay.orders.create(orderOptions);

      res.json({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency
      });
    } catch (error: any) {
      console.error('Error creating Razorpay order:', error);
      res.status(500).json({ error: 'Failed to create payment order.' });
    }
  }

  async verifyRazorpayPayment(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, plan, billingCycle } = req.body;

    try {
      const secret = process.env.RAZORPAY_KEY_SECRET!;
      
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        res.status(400).json({ error: 'Invalid payment signature.' });
        return;
      }

      // Find the subscription plan from DB based on name and cycle
      const subscriptionPlan = await prisma.subscriptionPlan.findFirst({
        where: { name: { equals: plan, mode: 'insensitive' } }
      });

      const planId = subscriptionPlan?.id || 'default-plan-id';

      // For this implementation, we will update or create the OrganizationSubscription
      const orgSub = await prisma.organizationSubscription.upsert({
        where: { organizationId },
        update: {
          status: 'ACTIVE',
          billingCycle: billingCycle,
          paymentProvider: 'RAZORPAY',
          startDate: new Date(),
          renewalDate: billingCycle === 'annual' 
            ? new Date(new Date().setFullYear(new Date().getFullYear() + 1)) 
            : new Date(new Date().setMonth(new Date().getMonth() + 1)),
        },
        create: {
          organizationId,
          planId: planId,
          billingCycle: billingCycle,
          status: 'ACTIVE',
          paymentProvider: 'RAZORPAY',
          startDate: new Date(),
          renewalDate: billingCycle === 'annual' 
            ? new Date(new Date().setFullYear(new Date().getFullYear() + 1)) 
            : new Date(new Date().setMonth(new Date().getMonth() + 1)),
        }
      });

      res.json({ success: true, subscription: orgSub });
    } catch (error: any) {
      console.error('Error verifying Razorpay payment:', error);
      res.status(500).json({ error: 'Failed to verify payment.' });
    }
  }

  // --- End Razorpay Integration ---

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
