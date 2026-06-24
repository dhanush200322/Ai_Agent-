import { QueueJob } from '../../queue/providers/queue-provider.interface';
import { PrismaClient } from '@prisma/client';
import { InvoiceEngine } from '../engine/invoice.engine';

const prisma = new PrismaClient() as any;

export class WebhookProcessorWorker {
  private invoiceEngine: InvoiceEngine;

  constructor() {
    this.invoiceEngine = new InvoiceEngine();
  }

  async process(job: QueueJob): Promise<void> {
    const { webhookEventId } = job.payload.payload;

    const webhookEvent = await prisma.billingWebhookEvent.findUnique({
      where: { id: webhookEventId }
    });

    if (!webhookEvent || webhookEvent.processed) return;

    try {
      const payload = JSON.parse(webhookEvent.payload);

      if (webhookEvent.eventType === 'invoice.payment_succeeded') {
        const invoiceNumber = payload.data.object.metadata?.invoiceNumber;
        const providerPaymentId = payload.data.object.payment_intent;

        if (invoiceNumber) {
          const invoice = await prisma.invoice.findUnique({ where: { invoiceNumber } });
          if (invoice) {
            await this.invoiceEngine.markPaid(invoice.id, providerPaymentId);
          }
        }
      }

      await prisma.billingWebhookEvent.update({
        where: { id: webhookEventId },
        data: { processed: true, processedAt: new Date() }
      });

    } catch (error: any) {
      await prisma.billingWebhookEvent.update({
        where: { id: webhookEventId },
        data: { error: error.message }
      });
      throw error; // Let QueueEngine retry
    }
  }
}
