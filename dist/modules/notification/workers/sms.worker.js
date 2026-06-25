"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMSWorker = void 0;
const delivery_engine_1 = require("../engine/delivery.engine");
const deliveryEngine = new delivery_engine_1.DeliveryEngine();
class SMSWorker {
    async process(job) {
        const notificationId = job.payload?.payload?.notificationId;
        if (notificationId) {
            await deliveryEngine.deliver(notificationId);
        }
    }
}
exports.SMSWorker = SMSWorker;
