"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerManager = void 0;
const client_1 = require("@prisma/client");
const os = __importStar(require("os"));
const prisma = new client_1.PrismaClient();
class WorkerManager {
    provider;
    capabilities;
    hostname;
    isShuttingDown = false;
    heartbeatInterval;
    constructor(provider, capabilities = ['*']) {
        this.provider = provider;
        this.capabilities = capabilities;
        this.hostname = `${os.hostname()}-${process.pid}`;
        this.setupGracefulShutdown();
    }
    async start(concurrency = 10) {
        console.log(`Starting WorkerManager on node ${this.hostname}`);
        await prisma.workerNode.upsert({
            where: { hostname: this.hostname },
            update: { status: client_1.WorkerStatus.ONLINE, lastHeartbeat: new Date(), concurrency, capabilities: JSON.stringify(this.capabilities) },
            create: { hostname: this.hostname, status: client_1.WorkerStatus.ONLINE, concurrency, capabilities: JSON.stringify(this.capabilities) }
        });
        this.startHeartbeat();
    }
    registerWorker(queueName, concurrency, processor) {
        // Middleware injection happens in the dispatcher, but WorkerManager delegates the raw BullMQ worker registration to the provider.
        this.provider.registerWorker(queueName, concurrency, processor);
    }
    startHeartbeat() {
        this.heartbeatInterval = setInterval(async () => {
            if (this.isShuttingDown)
                return;
            try {
                await prisma.workerNode.update({
                    where: { hostname: this.hostname },
                    data: { lastHeartbeat: new Date() }
                });
            }
            catch (err) {
                console.error('Failed to update worker heartbeat', err);
            }
        }, 15000); // 15 seconds
    }
    setupGracefulShutdown() {
        const shutdown = async () => {
            if (this.isShuttingDown)
                return;
            this.isShuttingDown = true;
            console.log(`\nSIGINT received. Initiating graceful shutdown for ${this.hostname}...`);
            if (this.heartbeatInterval)
                clearInterval(this.heartbeatInterval);
            // Stop accepting jobs & finish current
            await this.provider.disconnect();
            // Update Node status
            try {
                await prisma.workerNode.update({
                    where: { hostname: this.hostname },
                    data: { status: client_1.WorkerStatus.OFFLINE, lastHeartbeat: new Date() }
                });
            }
            catch (e) { }
            console.log(`WorkerNode ${this.hostname} successfully shut down.`);
            process.exit(0);
        };
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
    }
}
exports.WorkerManager = WorkerManager;
