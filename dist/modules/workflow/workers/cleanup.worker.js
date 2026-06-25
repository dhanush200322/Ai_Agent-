"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanupWorker = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const CleanupWorker = async (job, _context) => {
    await job.log('Starting execution logs cleanup...');
    // Clean up completed executions older than 30 days
    const thresholdDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
    const deletedLogs = await prisma.workflowExecution.deleteMany({
        where: {
            status: 'COMPLETED',
            finishedAt: { lt: thresholdDate }
        }
    });
    await job.log(`Cleaned up ${deletedLogs.count} historical executions.`);
    await job.updateProgress(100);
};
exports.CleanupWorker = CleanupWorker;
