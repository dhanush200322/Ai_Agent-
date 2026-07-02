"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookProcessorWorker = void 0;
const prisma_1 = require("../../../shared/prisma");
const invoice_engine_1 = require("../engine/invoice.engine");
class WebhookProcessorWorker {
    invoiceEngine;
    constructor() {
        this.invoiceEngine = new invoice_engine_1.InvoiceEngine();
    }
    async process(job) {
        const { webhookEventId } = job.payload.payload;
        const webhookEvent = await prisma_1.prisma.billingWebhookEvent.findUnique({
            where: { id: webhookEventId }
        });
        if (!webhookEvent || webhookEvent.processed)
            return;
        try {
            const payload = JSON.parse(webhookEvent.payload);
            if (webhookEvent.eventType === 'invoice.payment_succeeded') {
                const invoiceNumber = payload.data.object.metadata?.invoiceNumber;
                const providerPaymentId = payload.data.object.payment_intent;
                if (invoiceNumber) {
                    const invoice = await prisma_1.prisma.invoice.findUnique({ where: { invoiceNumber } });
                    if (invoice) {
                        await this.invoiceEngine.markPaid(invoice.id, providerPaymentId);
                    }
                }
            }
            await prisma_1.prisma.billingWebhookEvent.update({
                where: { id: webhookEventId },
                data: { processed: true, processedAt: new Date() }
            });
        }
        catch (error) {
            await prisma_1.prisma.billingWebhookEvent.update({
                where: { id: webhookEventId },
                data: { error: error.message }
            });
            throw error; // Let QueueEngine retry
        }
    }
}
exports.WebhookProcessorWorker = WebhookProcessorWorker;
