import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { SubscriptionEngine } from '../engine/subscription.engine';
import { StripeProvider } from '../providers/stripe.provider';
import { QueueManager } from '../../queue/engine/queue-manager';
import { BullMQProvider } from '../../queue/providers/bullmq.provider';

const prisma = new PrismaClient() as any;

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

  async webhook(req: Request, res: Response) {
    const signature = req.headers['stripe-signature'] as string;
    const rawBody = (req as any).rawBody; // Assumes raw body parser is active for this route
    
    try {
      const event = this.stripeProvider.verifyWebhook(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_123');
      
      // 1. Store immutable webhook event
      const webhookEvent = await prisma.billingWebhookEvent.create({
        data: {
          provider: 'STRIPE',
          providerEventId: event.id,
          eventType: event.type,
          payload: JSON.stringify(event)
        }
      });

      // 2. Enqueue for asynchronous robust processing
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
