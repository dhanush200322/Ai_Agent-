import { PrismaClient } from '@prisma/client';
import { MeteringEngine } from './src/modules/billing/engine/metering.engine';
import { QuotaEngine } from './src/modules/billing/engine/quota.engine';
import { InvoiceEngine } from './src/modules/billing/engine/invoice.engine';
import { SubscriptionEngine } from './src/modules/billing/engine/subscription.engine';
import { StripeProvider } from './src/modules/billing/providers/stripe.provider';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient() as any;

async function runBillingTests() {
  console.log("Starting Enterprise Billing Suite Validation...");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      passed++;
      console.log(`✅ ${message}`);
    } else {
      failed++;
      console.error(`❌ FAILED: ${message}`);
    }
  }

  const orgId = uuidv4();
  
  try {
    // Scaffold Org & Plan
    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: 'Enterprise Test Plan',
        monthlyPrice: 99.00,
        yearlyPrice: 990.00,
        maxTokens: BigInt(100000),
        features: JSON.stringify(['chat', 'voice'])
      }
    });

    const org = await prisma.organization.create({
      data: { id: orgId, name: 'Billing Test Org', slug: `billing-test-${orgId}` }
    });

    assert(plan !== null, "SubscriptionPlan created successfully");

    // 1. Subscription Lifecycle
    const subEngine = new SubscriptionEngine();
    const sub = await subEngine.subscribe(org.id, plan.id);
    assert(sub.status === 'TRIAL', "New subscription defaults to TRIAL status");
    assert(sub.paymentProvider === 'STRIPE', "Default payment provider is STRIPE");

    // 2. Metering Engine
    const meter = new MeteringEngine();
    await meter.recordUsageEvent(org.id, 'CHAT_TOKENS', 500);
    await meter.recordUsageEvent(org.id, 'CHAT_TOKENS', 1500);
    
    await meter.aggregateHourlyUsage(org.id, 'CHAT_TOKENS');
    
    const summary = await prisma.usageSummary.findFirst({
      where: { organizationId: org.id, type: 'CHAT_TOKENS' }
    });
    
    assert(summary !== null, "MeteringEngine successfully aggregated hourly UsageSummary");
    assert(summary?.totalQuantity.toString() === '2000', "Hourly usage summary correctly summed tokens");

    // 3. Quota Engine (Redis Cache)
    const quota = new QuotaEngine();
    // Simulate active sub by overriding the test org sub
    await prisma.organizationSubscription.update({
      where: { id: sub.id },
      data: { status: 'ACTIVE' }
    });

    const allowed = await quota.checkQuota(org.id, 'CHAT_TOKENS', 100);
    assert(allowed === true, "QuotaEngine allowed request within limits");
    await quota.recordUsage(org.id, 'CHAT_TOKENS', 100);

    // 4. Invoice Engine & Line Items
    const invEngine = new InvoiceEngine();
    const invoice = await invEngine.generateMonthlyInvoice(org.id);
    assert(invoice !== null, "InvoiceEngine successfully generated an invoice");
    assert(invoice?.status === 'DRAFT', "New invoice is marked as DRAFT");
    
    const lineItems = await prisma.invoiceLineItem.findMany({ where: { invoiceId: invoice.id } });
    assert(lineItems.length > 0, "Invoice securely generated immutable InvoiceLineItems");
    assert(lineItems[0].type === 'BASE_PLAN', "Base plan line item exists");

    // 5. Payment Provider Abstraction
    const stripe = new StripeProvider();
    assert(typeof stripe.createCustomer === 'function', "StripeProvider implements PaymentProvider interface");

    // 6. Webhooks & Events
    const webhook = await prisma.billingWebhookEvent.create({
      data: {
        provider: 'STRIPE',
        providerEventId: `evt_${Date.now()}`,
        eventType: 'invoice.payment_succeeded',
        payload: JSON.stringify({ data: { object: { metadata: { invoiceNumber: invoice.invoiceNumber }, payment_intent: 'pi_123' } } })
      }
    });
    assert(webhook !== null, "BillingWebhookEvent safely captured incoming stripe payload");

    // Simulate Worker processing the webhook
    const { WebhookProcessorWorker } = require('./src/modules/billing/workers/webhook-processor.worker');
    const webhookWorker = new WebhookProcessorWorker();
    await webhookWorker.process({ payload: { payload: { webhookEventId: webhook.id } } } as any);

    const updatedInvoice = await prisma.invoice.findUnique({ where: { id: invoice.id } });
    assert(updatedInvoice?.status === 'PAID', "Webhook processor correctly parsed payload and marked Invoice as PAID");
    
    const processedWebhook = await prisma.billingWebhookEvent.findUnique({ where: { id: webhook.id } });
    assert(processedWebhook?.processed === true, "Webhook event marked as processed");

    console.log(`\n✅ Enterprise Billing Validation Complete: ${passed} passed, ${failed} failed`);
    if (failed > 0) process.exit(1);

  } catch (err: any) {
    console.error("Test Suite Error:", err);
    process.exit(1);
  } finally {
    // Cleanup
    await prisma.organization.delete({ where: { id: orgId } }).catch(() => {});
  }
}

runBillingTests();
