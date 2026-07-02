"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryWorker = void 0;
const prisma_1 = require("../../../shared/prisma");
const delivery_engine_1 = require("../engine/delivery.engine");
const retry_engine_1 = require("../engine/retry.engine");
const deliveryEngine = new delivery_engine_1.DeliveryEngine();
const retryEngine = new retry_engine_1.RetryEngine();
class RetryWorker {
    async process(job) {
        const notificationId = job.payload?.payload?.notificationId;
        if (!notificationId)
            return;
        const notif = await prisma_1.prisma.notification.findUnique({ where: { id: notificationId } });
        if (!notif)
            return;
        if (notif.retryCount >= notif.maxRetries) {
            await prisma_1.prisma.notification.update({
                where: { id: notificationId },
                data: { status: 'FAILED', errorMessage: 'Max retries exceeded' },
            });
            return;
        }
        const delay = retryEngine.calculateBackoff(notif.retryCount);
        await new Promise(resolve => setTimeout(resolve, Math.min(delay, 50)));
        await deliveryEngine.deliver(notificationId);
    }
}
exports.RetryWorker = RetryWorker;
