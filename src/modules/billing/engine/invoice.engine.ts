import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient() as any;

export class InvoiceEngine {

  async generateMonthlyInvoice(organizationId: string): Promise<any> {
    const org = await prisma.organizationSubscription.findUnique({
      where: { organizationId },
      include: { plan: true },
    });

    if (!org || org.status !== 'ACTIVE') return null;

    const subtotal = org.plan.monthlyPrice;
    const tax = Number(subtotal) * 0.1; // Stubbed 10% tax
    const total = Number(subtotal) + tax;

    const invoiceNumber = `INV-${Date.now()}-${uuidv4().substring(0, 4).toUpperCase()}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        organizationId,
        subtotal,
        tax,
        total,
        status: 'DRAFT',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
      }
    });

    // Capture Line Items immutably
    await prisma.invoiceLineItem.create({
      data: {
        invoiceId: invoice.id,
        description: `${org.plan.name} Base Plan`,
        quantity: 1,
        unitPrice: subtotal,
        amount: subtotal,
        type: 'BASE_PLAN'
      }
    });

    // Retrieve overages from MeteringEngine summaries (Stubbed)
    // Here we would query UsageSummary where period = MONTHLY, and charge overages

    // Emit event for state machine
    await prisma.billingEvent.create({
      data: {
        organizationId,
        eventType: 'INVOICE_GENERATED',
        payload: JSON.stringify({ invoiceId: invoice.id, total })
      }
    });

    return invoice;
  }

  async markPaid(invoiceId: string, providerPaymentId: string): Promise<void> {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'PAID', paidAt: new Date() }
    });

    const inv = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (inv) {
      await prisma.billingEvent.create({
        data: {
          organizationId: inv.organizationId,
          eventType: 'INVOICE_PAID',
          payload: JSON.stringify({ invoiceId, providerPaymentId })
        }
      });
    }
  }
}
