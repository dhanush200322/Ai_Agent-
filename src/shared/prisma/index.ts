import { PrismaClient } from "@prisma/client";

// Render internal PostgreSQL connections do not support SSL/TLS.
// The Prisma CLI handles this gracefully, but the Node.js runtime Client throws P1011 (OpenSSL Error).
// We patch the URL at runtime to explicitly disable SSL for internal Render connections.
let dbUrl = process.env.DATABASE_URL;
if (dbUrl && process.env.RENDER) {
  // If the URL does not contain 'onrender.com', it is the internal Render URL (e.g., dpg-xxxx)
  const isInternalRenderUrl = !dbUrl.includes('onrender.com');
  if (isInternalRenderUrl && !dbUrl.includes('sslmode=')) {
    dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'sslmode=disable';
  }
}

const globalForPrisma = globalThis as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
