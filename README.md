# Nexora AI Backend

Enterprise-grade AI Agent backend system, structured to scale with clean architecture principles.

## Directory Structure

```
enterprise-ai-agent-backend/
├── src/
│   ├── app.ts                  # App configuration & middleware attachment
│   ├── server.ts               # Entrypoint & HTTP server setup
│   ├── config/                 # App configurations (db, redis, auth, ai, env etc.)
│   ├── database/               # Prisma schema, migrations, seeds, repositories
│   ├── modules/                # Feature modules (auth, users, agents, chat, knowledge, workflows, etc.)
│   ├── ai/                     # Core AI modules (models, prompts, embeddings, RAG, memory, planner, reasoning)
│   ├── integrations/           # Third-party integrations (OpenAI, Anthropic, Gemini, Slack, Gmail, etc.)
│   ├── middleware/             # Express middlewares (auth, validation, error handler)
│   ├── routes/                 # Express routes mapping
│   ├── shared/                 # Shared utilities, constants, decorators, interfaces, DTOs, etc.
│   └── jobs/                   # Background jobs, queues, workers (BullMQ)
├── prisma/                     # Local prisma storage
├── uploads/                    # Local uploads directory
├── logs/                       # Application logs
├── scripts/                    # Shell & database utility scripts
├── tests/                      # Automated test suite
└── docker/                     # Dockerfiles & container configs
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
4. Spin up local database and Redis services:
   ```bash
   docker-compose up -d
   ```
5. Run migrations:
   ```bash
   npx prisma migrate dev
   ```
6. Run the application in development mode:
   ```bash
   npm run dev
   ```
