"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginWorker = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class LoginWorker {
    async process(job) {
        const { userId, ipAddress, userAgent, mfa } = job.data;
        // Write an async telemetry log
        console.log(`[Queue] Processing login event for user ${userId}. MFA: ${mfa}`);
        // In a real system, we'd send data to DataDog or a telemetry service here
        // For now, we ensure the user exists and update a generic lastLogin flag
        await prisma.user.update({
            where: { id: userId },
            data: { status: 'ACTIVE' } // Touch the record
        });
    }
}
exports.LoginWorker = LoginWorker;
