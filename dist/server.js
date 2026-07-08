"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../.env') });
const app_1 = __importDefault(require("./app"));
const prisma_1 = require("./shared/prisma");
const billing_cron_1 = require("./modules/billing/workers/billing.cron");
const PORT = process.env.PORT || 3000;
async function bootstrap() {
    try {
        await prisma_1.prisma.$connect();
        console.log("✅ PostgreSQL Connected");
        (0, billing_cron_1.startBillingCronJobs)();
        console.log("✅ Billing Cron Jobs Initialized");
        const server = app_1.default.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
        });
        // Graceful shutdown handling
        process.on('SIGTERM', async () => {
            console.log('SIGTERM signal received: closing HTTP server');
            server.close(() => {
                console.log('HTTP server closed');
            });
            await prisma_1.prisma.$disconnect();
        });
        process.on('SIGINT', async () => {
            console.log('SIGINT signal received: closing HTTP server');
            server.close(() => {
                console.log('HTTP server closed');
            });
            await prisma_1.prisma.$disconnect();
        });
    }
    catch (error) {
        console.error("❌ Database connection failed");
        console.error(error);
        process.exit(1);
    }
}
bootstrap();
