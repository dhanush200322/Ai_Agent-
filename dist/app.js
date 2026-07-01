"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const crypto_1 = __importDefault(require("crypto"));
const auth_routes_1 = __importDefault(require("./modules/auth/routes/auth.routes"));
const rbac_routes_1 = __importDefault(require("./modules/rbac/routes/rbac.routes"));
const users_rbac_routes_1 = __importDefault(require("./modules/rbac/routes/users.rbac.routes"));
const organization_routes_1 = __importDefault(require("./modules/organization/routes/organization.routes"));
const user_routes_1 = __importDefault(require("./modules/users/routes/user.routes"));
const agent_routes_1 = __importDefault(require("./modules/agents/routes/agent.routes"));
const knowledge_routes_1 = __importDefault(require("./modules/knowledge/routes/knowledge.routes"));
const chat_routes_1 = __importDefault(require("./modules/chat/routes/chat.routes"));
const notification_routes_1 = __importDefault(require("./modules/notification/routes/notification.routes"));
const workflow_routes_1 = __importDefault(require("./modules/workflow/routes/workflow.routes"));
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = __importDefault(require("./shared/logger/logger"));
const AppError_1 = require("./shared/errors/AppError");
const app = (0, express_1.default)();
// Request ID Middleware
app.use((req, res, next) => {
    req.reqId = crypto_1.default.randomUUID();
    res.setHeader('X-Request-Id', req.reqId);
    next();
});
// Standard Security & Core Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || '*',
    credentials: true
}));
app.use((0, compression_1.default)());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Logging Middleware
app.use((0, morgan_1.default)('combined', {
    stream: {
        write: (message) => logger_1.default.info(message.trim())
    }
}));
// Health check endpoint
app.use('/health', health_routes_1.default);
// API Routes
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/roles', rbac_routes_1.default);
app.use('/api/v1/users', users_rbac_routes_1.default);
app.use('/api/v1/users', user_routes_1.default);
app.use('/api/v1/organization', organization_routes_1.default);
app.use('/api/v1/agents', agent_routes_1.default);
app.use('/api/v1/knowledge', knowledge_routes_1.default);
app.use('/api/v1/chat', chat_routes_1.default);
app.use('/api/v1/notifications', notification_routes_1.default);
app.use('/api/v1/workflows', workflow_routes_1.default);
// Catch 404 and forward to error handler
app.use((req, _res, next) => {
    next(new AppError_1.NotFoundError(`Route ${req.originalUrl} not found`));
});
// Global Error Handler
app.use(errorHandler_1.globalErrorHandler);
exports.default = app;
