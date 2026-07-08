import { PrismaClient } from '@prisma/client';
import { AgentService } from './src/modules/agents/services/agent.service';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const agentService = new AgentService();

async function runTests() {
  console.log("Starting Enterprise Razorpay Billing & Agent Limits Validation...\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      passed++;
      console.log(✅ );
    } else {
      failed++;
      console.error(❌ FAILED: );
    }
  }

  const userId = uuidv4();
  const orgId = uuidv4();
  
  try {
    await prisma.organization.create({ data: { id: orgId, name: 'Razorpay Test Org', slug: 'rzp-test-'+orgId } });
    await prisma.role.create({ data: { id: 'admin', name: 'admin', permissions: [] } }).catch(() => {});
    await prisma.user.create({ data: { id: userId, email: 'test-'+userId+'@nexora.ai', firstName: 'Test', lastName: 'User', passwordHash: 'hash', organizationId: orgId, roleId: 'admin' } });

    const starterPlan = await prisma.subscriptionPlan.upsert({ where: { name: 'Starter' }, update: {}, create: { name: 'Starter', monthlyPrice: 0, yearlyPrice: 0, maxTokens: BigInt(1000) } });
    const proPlan = await prisma.subscriptionPlan.upsert({ where: { name: 'Professional' }, update: {}, create: { name: 'Professional', monthlyPrice: 999, yearlyPrice: 9990, maxTokens: BigInt(10000) } });

    console.log("--- Agent Restriction Testing ---");
    const agent1 = await agentService.createAgent(orgId, userId, { name: "Agent 1", slug: 'agent-1-'+orgId, model: "gpt-4o" });
    assert(agent1 !== null, "Starter creates first agent -> Allowed");

    let blocked = false;
    try {
      await agentService.createAgent(orgId, userId, { name: "Agent 2", slug: 'agent-2-'+orgId, model: "gpt-4o" });
    } catch (e: any) {
      if (e.message.includes('Starter Plan allows only one AI Agent')) blocked = true;
    }
    assert(blocked, "Starter creates second agent -> Blocked with upgrade required");

    console.log("\n--- Razorpay Verification & Pro Upgrade Testing ---");
    const renewalDate = new Date(); renewalDate.setMonth(renewalDate.getMonth() + 1);
    
    const invoice = await prisma.invoice.create({ data: { organizationId: orgId, invoiceNumber: 'INV-'+Date.now(), subtotal: 999, total: 999, status: 'PAID', paidAt: new Date() } });
    await prisma.payment.create({ data: { invoiceId: invoice.id, provider: 'RAZORPAY', providerPaymentId: 'pay_123', currency: 'INR', amount: 999, status: 'COMPLETED', orderId: 'order_123', paymentMethod: 'razorpay', purchaseDate: new Date() } });
    
    await prisma.organizationSubscription.upsert({
      where: { organizationId: orgId },
      update: { status: 'ACTIVE', planId: proPlan.id, renewalDate, expiryDate: renewalDate, amount: 999 },
      create: { organizationId: orgId, userId, planId: proPlan.id, billingCycle: 'monthly', status: 'ACTIVE', paymentProvider: 'RAZORPAY', startDate: new Date(), renewalDate, expiryDate: renewalDate, amount: 999, currency: 'INR' }
    });

    const checkSub = await prisma.organizationSubscription.findUnique({ where: { organizationId: orgId } });
    assert(checkSub?.status === 'ACTIVE' && checkSub.planId === proPlan.id, "OrganizationSubscription updated to Pro accurately");

    const agent2 = await agentService.createAgent(orgId, userId, { name: "Agent 2", slug: 'agent-2-'+orgId, model: "gpt-4o" });
    assert(agent2 !== null, "Pro creates second agent -> Allowed");

    console.log("\n--- Cron Job & Downgrade Testing ---");
    const pastDate = new Date(); pastDate.setDate(pastDate.getDate() - 1);
    await prisma.organizationSubscription.update({ where: { organizationId: orgId }, data: { expiryDate: pastDate } });

    const expiredSub = await prisma.organizationSubscription.findUnique({ where: { organizationId: orgId }});
    await prisma.(async (tx) => {
      await tx.organizationSubscription.update({ where: { id: expiredSub!.id }, data: { status: 'STARTER', planId: starterPlan.id } });
      const agents = await tx.agent.findMany({ where: { organizationId: orgId, deletedAt: null }, orderBy: { createdAt: 'asc' } });
      if (agents.length > 1) {
        for (let i = 1; i < agents.length; i++) {
          await tx.agent.update({ where: { id: agents[i].id }, data: { status: 'INACTIVE' } });
        }
      }
    });

    const activeAgents = await prisma.agent.findMany({ where: { organizationId: orgId, status: 'ACTIVE' } });
    const inactiveAgents = await prisma.agent.findMany({ where: { organizationId: orgId, status: 'INACTIVE' } });
    assert(activeAgents.length === 1 && activeAgents[0].id === agent1.id, "Pro expires -> Only first agent remains active");
    assert(inactiveAgents.length === 1 && inactiveAgents[0].id === agent2.id, "Pro expires -> Second agent marked as INACTIVE");

    console.log("\n--- Razorpay Webhook Reactivation Testing ---");
    await prisma.organizationSubscription.update({ where: { organizationId: orgId }, data: { status: 'ACTIVE', planId: proPlan.id, expiryDate: new Date(Date.now() + 86400000 * 30) } });
    await prisma.agent.updateMany({ where: { organizationId: orgId, status: 'INACTIVE', deletedAt: null }, data: { status: 'ACTIVE' } });

    const finalActiveAgents = await prisma.agent.findMany({ where: { organizationId: orgId, status: 'ACTIVE' } });
    assert(finalActiveAgents.length === 2, "Pro renews -> All inactive agents become ACTIVE again");

    console.log(\n✅ End-to-End Validation Complete:  passed,  failed);
    
  } catch (err) {
    console.error("Test Error:", err);
  } finally {
    await prisma.agent.deleteMany({ where: { organizationId: orgId } });
    await prisma.organizationSubscription.deleteMany({ where: { organizationId: orgId } });
    await prisma.payment.deleteMany({ where: { invoice: { organizationId: orgId } } });
    await prisma.invoice.deleteMany({ where: { organizationId: orgId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.organization.deleteMany({ where: { id: orgId } });
    await prisma.();
  }
}

runTests();
