"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookWorker = void 0;
const delivery_engine_1 = require("../engine/delivery.engine");
const deliveryEngine = new delivery_engine_1.DeliveryEngine();
class WebhookWorker {
    async process(job) {
        const notificationId = job.payload?.payload?.notificationId;
        if (notificationId) {
            await deliveryEngine.deliver(notificationId);
        }
    }
}
exports.WebhookWorker = WebhookWorker;
