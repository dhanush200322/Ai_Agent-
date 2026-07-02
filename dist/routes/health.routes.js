"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../shared/prisma");
const express_1 = require("express");
const ApiResponse_1 = require("../shared/response/ApiResponse");
const redis_1 = require("../config/redis");
const js_client_rest_1 = require("@qdrant/js-client-rest");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
const qdrant = new js_client_rest_1.QdrantClient({
    url: process.env.QDRANT_URL || 'http://localhost:6333',
    apiKey: process.env.QDRANT_API_KEY,
});
router.get('/', (req, res) => {
    res.status(200).json(ApiResponse_1.ApiResponse.success({ status: 'OK' }, 'Health check passed', req.reqId));
});
router.get('/live', (req, res) => {
    res.status(200).json(ApiResponse_1.ApiResponse.success({ status: 'healthy' }, 'Liveness check passed', req.reqId));
});
router.get('/ready', async (req, res) => {
    try {
        // Check DB
        await prisma_1.prisma.$queryRawUnsafe('SELECT 1');
        // Check Redis
        await redis_1.RedisConnectionManager.ping();
        // Check Storage
        const uploadDir = path_1.default.join(process.cwd(), 'uploads');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        fs_1.default.accessSync(uploadDir, fs_1.default.constants.W_OK);
        res.status(200).json(ApiResponse_1.ApiResponse.success({ status: 'ready' }, 'Readiness check passed', req.reqId));
    }
    catch (err) {
        res.status(503).json(ApiResponse_1.ApiResponse.error(503, `Readiness check failed: ${err.message}`, req.reqId));
    }
});
router.get('/database', async (req, res) => {
    try {
        await prisma_1.prisma.$queryRawUnsafe('SELECT 1');
        res.status(200).json(ApiResponse_1.ApiResponse.success({ status: 'healthy', database: 'connected' }, 'Database check passed', req.reqId));
    }
    catch (err) {
        res.status(503).json(ApiResponse_1.ApiResponse.error(503, `Database check failed: ${err.message}`, req.reqId));
    }
});
router.get('/redis', async (req, res) => {
    try {
        await redis_1.RedisConnectionManager.ping();
        res.status(200).json(ApiResponse_1.ApiResponse.success({ status: 'healthy', redis: 'connected' }, 'Redis check passed', req.reqId));
    }
    catch (err) {
        res.status(503).json(ApiResponse_1.ApiResponse.error(503, `Redis check failed: ${err.message}`, req.reqId));
    }
});
router.get('/queue', async (req, res) => {
    try {
        // BullMQ requires Redis connection
        await redis_1.RedisConnectionManager.ping();
        res.status(200).json(ApiResponse_1.ApiResponse.success({ status: 'healthy', queue: 'active' }, 'Queue check passed', req.reqId));
    }
    catch (err) {
        res.status(503).json(ApiResponse_1.ApiResponse.error(503, `Queue check failed: ${err.message}`, req.reqId));
    }
});
router.get('/ai', async (req, res) => {
    try {
        await qdrant.getCollections();
        res.status(200).json(ApiResponse_1.ApiResponse.success({ status: 'healthy', ai: 'Qdrant connected' }, 'AI Vector DB check passed', req.reqId));
    }
    catch (err) {
        res.status(503).json(ApiResponse_1.ApiResponse.error(503, `AI check failed: ${err.message}`, req.reqId));
    }
});
router.get('/storage', (req, res) => {
    try {
        const uploadDir = path_1.default.join(process.cwd(), 'uploads');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        fs_1.default.accessSync(uploadDir, fs_1.default.constants.W_OK);
        res.status(200).json(ApiResponse_1.ApiResponse.success({ status: 'healthy', storage: 'writable' }, 'Storage check passed', req.reqId));
    }
    catch (err) {
        res.status(503).json(ApiResponse_1.ApiResponse.error(503, `Storage check failed: ${err.message}`, req.reqId));
    }
});
exports.default = router;
