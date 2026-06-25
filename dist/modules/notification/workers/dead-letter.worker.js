"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeadLetterWorker = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class DeadLetterWorker {
    async process(job) {
        const notificationId = job.payload?.payload?.notificationId;
        if (!notificationId)
            return;
        await prisma.notification.update({
            where: { id: notificationId },
            data: { status: 'FAILED', errorMessage: `Failed permanently in queue: ${job.payload?.reason || 'Unknown error'}` },
        });
    }
}
exports.DeadLetterWorker = DeadLetterWorker;
