"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeadLetterWorker = void 0;
const prisma_1 = require("../../../shared/prisma");
class DeadLetterWorker {
    async process(job) {
        const notificationId = job.payload?.payload?.notificationId;
        if (!notificationId)
            return;
        await prisma_1.prisma.notification.update({
            where: { id: notificationId },
            data: { status: 'FAILED', errorMessage: `Failed permanently in queue: ${job.payload?.reason || 'Unknown error'}` },
        });
    }
}
exports.DeadLetterWorker = DeadLetterWorker;
