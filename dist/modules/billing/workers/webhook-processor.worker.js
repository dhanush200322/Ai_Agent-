"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookProcessorWorker = void 0;
const client_1 = require("@prisma/client");
const invoice_engine_1 = require("../engine/invoice.engine");
const prisma = new client_1.PrismaClient();
class WebhookProcessorWorker {
    invoiceEngine;
    constructor() {
        this.invoiceEngine = new invoice_engine_1.InvoiceEngine();
    }
    async process(job) {
        const { webhookEventId } = job.payload.payload;
        const webhookEvent = await prisma.billingWebhookEvent.findUnique({
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
        }
        catch (error) {
            await prisma.billingWebhookEvent.update({
                where: { id: webhookEventId },
                data: { error: error.message }
            });
            throw error; // Let QueueEngine retry
        }
    }
}
exports.WebhookProcessorWorker = WebhookProcessorWorker;
