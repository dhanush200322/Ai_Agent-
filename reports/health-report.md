# Health Diagnostics Diagnostic Report

Generated: 2026-06-25 14:45:38 UTC
Overall Status: PASS

## Endpoint Checks Statuses
- **GET /health**: PASS (Server alive)
- **GET /health/live**: PASS (Liveness active)
- **GET /health/ready**: PASS (System dependencies connected)
- **GET /health/database**: PASS (Postgres connected and queryable)
- **GET /health/redis**: PASS (Redis server responding)
- **GET /health/queue**: PASS (BullMQ ready)
- **GET /health/ai**: PASS (Qdrant connection active)
- **GET /health/storage**: PASS (Storage path writable)
