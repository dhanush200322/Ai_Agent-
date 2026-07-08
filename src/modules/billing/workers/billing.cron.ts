import cron from 'node-cron';
import { prisma } from '../../../shared/prisma';
import { EmailService } from '../services/email.service';

const emailService = new EmailService();

export const startBillingCronJobs = () => {
  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily billing cron job...');

    try {
      await processReminders();
      await processDowngrades();
    } catch (error) {
      console.error('Error running billing cron jobs:', error);
    }
  });
};

const processReminders = async () => {
  const now = new Date();
  
  // Subscriptions ending in exactly 30 days (Annual)
  const in30Days = new Date(now);
  in30Days.setDate(in30Days.getDate() + 30);
  
  const subs30 = await prisma.organizationSubscription.findMany({
    where: {
      status: 'ACTIVE',
      billingCycle: 'annual',
      expiryDate: {
        gte: new Date(in30Days.setHours(0, 0, 0, 0)),
        lte: new Date(in30Days.setHours(23, 59, 59, 999))
      },
      reminder30Sent: false,
    },
    include: { user: true }
  });

  for (const sub of subs30) {
    if (sub.user?.email) {
      await emailService.sendReminderEmail(sub.user.email, sub.user.firstName, 30, true);
      await prisma.organizationSubscription.update({
        where: { id: sub.id },
        data: { reminder30Sent: true }
      });
    }
  }

  // Subscriptions ending in exactly 7 days (Annual)
  const in7Days = new Date(now);
  in7Days.setDate(in7Days.getDate() + 7);
  
  const subs7 = await prisma.organizationSubscription.findMany({
    where: {
      status: 'ACTIVE',
      billingCycle: 'annual',
      expiryDate: {
        gte: new Date(in7Days.setHours(0, 0, 0, 0)),
        lte: new Date(in7Days.setHours(23, 59, 59, 999))
      },
      reminder7Sent: false,
    },
    include: { user: true }
  });

  for (const sub of subs7) {
    if (sub.user?.email) {
      await emailService.sendReminderEmail(sub.user.email, sub.user.firstName, 7, true);
      await prisma.organizationSubscription.update({
        where: { id: sub.id },
        data: { reminder7Sent: true }
      });
    }
  }

  // Subscriptions ending in exactly 3 days (Monthly)
  const in3Days = new Date(now);
  in3Days.setDate(in3Days.getDate() + 3);
  
  const subs3 = await prisma.organizationSubscription.findMany({
    where: {
      status: 'ACTIVE',
      billingCycle: 'monthly',
      expiryDate: {
        gte: new Date(in3Days.setHours(0, 0, 0, 0)),
        lte: new Date(in3Days.setHours(23, 59, 59, 999))
      },
      reminder3Sent: false,
    },
    include: { user: true }
  });

  for (const sub of subs3) {
    if (sub.user?.email) {
      await emailService.sendReminderEmail(sub.user.email, sub.user.firstName, 3, false);
      await prisma.organizationSubscription.update({
        where: { id: sub.id },
        data: { reminder3Sent: true }
      });
    }
  }
};

const processDowngrades = async () => {
  const now = new Date();
  
  // Find all ACTIVE subscriptions where expiryDate < now
  const expiredSubs = await prisma.organizationSubscription.findMany({
    where: {
      status: 'ACTIVE',
      expiryDate: {
        lt: now
      }
    },
    include: { plan: true }
  });

  for (const sub of expiredSubs) {
    console.log(`Downgrading subscription ${sub.id} for organization ${sub.organizationId}...`);

    // Find the Starter plan
    const starterPlan = await prisma.subscriptionPlan.findFirst({
      where: { name: { equals: 'Starter', mode: 'insensitive' } }
    });

    await prisma.$transaction(async (tx) => {
      // Update subscription to STARTER
      await tx.organizationSubscription.update({
        where: { id: sub.id },
        data: {
          status: 'STARTER',
          planId: starterPlan?.id || sub.planId, // Use starter plan ID if it exists
          reminder30Sent: false,
          reminder7Sent: false,
          reminder3Sent: false,
        }
      });

      // Get all agents for this organization, ordered by created date
      const agents = await tx.agent.findMany({
        where: { organizationId: sub.organizationId, deletedAt: null },
        orderBy: { createdAt: 'asc' }
      });

      // Keep only the first agent ACTIVE, set the rest to INACTIVE
      if (agents.length > 1) {
        for (let i = 1; i < agents.length; i++) {
          await tx.agent.update({
            where: { id: agents[i].id },
            data: { status: 'INACTIVE' }
          });
        }
      }
    });
  }
};
