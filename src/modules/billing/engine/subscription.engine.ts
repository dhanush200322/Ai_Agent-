import { prisma } from '../../../shared/prisma';
import { PrismaClient } from '@prisma/client';



export class SubscriptionEngine {

  async subscribe(organizationId: string, planId: string): Promise<any> {
    const activeSub = await prisma.organizationSubscription.findUnique({
      where: { organizationId }
    });

    if (activeSub) {
      throw new Error('Organization already has a subscription.');
    }

    const sub = await prisma.organizationSubscription.create({
      data: {
        organizationId,
        planId,
        billingCycle: 'MONTHLY',
        status: 'TRIAL',
        renewalDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 day trial
      }
    });

    await prisma.billingEvent.create({
      data: {
        organizationId,
        eventType: 'SUBSCRIPTION_CREATED',
        payload: JSON.stringify({ subscriptionId: sub.id, status: 'TRIAL' })
      }
    });

    return sub;
  }

  async cancel(organizationId: string): Promise<any> {
    const sub = await prisma.organizationSubscription.update({
      where: { organizationId },
      data: {
        status: 'CANCELLED',
        cancelDate: new Date(),
        autoRenew: false
      }
    });

    await prisma.billingEvent.create({
      data: {
        organizationId,
        eventType: 'SUBSCRIPTION_CANCELLED',
        payload: JSON.stringify({ subscriptionId: sub.id })
      }
    });

    return sub;
  }
}
