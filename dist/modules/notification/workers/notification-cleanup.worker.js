"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationCleanupWorker = void 0;
const client_1 = require("@prisma/client");
const delivery_engine_1 = require("../engine/delivery.engine");
const prisma = new client_1.PrismaClient();
const deliveryEngine = new delivery_engine_1.DeliveryEngine();
class NotificationCleanupWorker {
    async process() {
        const now = new Date();
        const schedules = await prisma.notificationSchedule.findMany({
            where: {
                isActive: true,
                runAt: { lte: now },
            },
            include: { notification: true },
        });
        for (const schedule of schedules) {
            try {
                await deliveryEngine.deliver(schedule.notificationId);
                await prisma.notificationSchedule.update({
                    where: { id: schedule.id },
                    data: {
                        isActive: false,
                        lastRunAt: now,
                    },
                });
            }
            catch (err) {
                console.error(`Scheduled notification delivery failed for schedule ID ${schedule.id}:`, err);
            }
        }
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        await prisma.notification.deleteMany({
            where: {
                createdAt: { lte: thirtyDaysAgo },
                status: { in: ['SENT', 'CANCELLED', 'FAILED'] }
            }
        });
    }
}
exports.NotificationCleanupWorker = NotificationCleanupWorker;
