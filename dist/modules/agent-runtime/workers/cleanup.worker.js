"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanupWorker = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class CleanupWorker {
    async processJob(job) {
        const { retentionDays } = job.data;
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - (retentionDays || 30));
        try {
            const deleted = await prisma.agentExecutionLog.deleteMany({
                where: { createdAt: { lt: dateThreshold } }
            });
            return { deletedLogs: deleted.count };
        }
        catch (error) {
            throw error;
        }
    }
}
exports.CleanupWorker = CleanupWorker;
