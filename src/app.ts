import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';

import authRoutes from './modules/auth/routes/auth.routes';
import rbacRoutes from './modules/rbac/routes/rbac.routes';
import userRbacRoutes from './modules/rbac/routes/users.rbac.routes';
import orgRoutes from './modules/organization/routes/organization.routes';
import userRoutes from './modules/users/routes/user.routes';
import agentRoutes from './modules/agents/routes/agent.routes';
import knowledgeRoutes from './modules/knowledge/routes/knowledge.routes';
import chatRoutes from './modules/chat/routes/chat.routes';
import notificationRoutes from './modules/notification/routes/notification.routes';
import workflowRoutes from './modules/workflow/routes/workflow.routes';
import vaultRoutes from './modules/vault/routes/vault.routes';
import healthRoutes from './routes/health.routes';
import { globalErrorHandler } from './middleware/errorHandler';
import logger from './shared/logger/logger';
import { NotFoundError } from './shared/errors/AppError';

const app: Express = express();

// Request ID Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  req.reqId = crypto.randomUUID();
  res.setHeader('X-Request-Id', req.reqId);
  next();
});


// Standard Security & Core Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging Middleware
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// Health check endpoint
app.use('/health', healthRoutes);

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/roles', rbacRoutes);
app.use('/api/v1/users', userRbacRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/organization', orgRoutes);
app.use('/api/v1/agents', agentRoutes);
app.use('/api/v1/knowledge', knowledgeRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/workflows', workflowRoutes);
app.use('/api/v1/vault', vaultRoutes);

// Catch 404 and forward to error handler
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
