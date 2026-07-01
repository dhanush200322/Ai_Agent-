import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import { RedisConnectionManager } from './src/config/redis';
import app from './src/app';
import * as http from 'http';

const prisma = new PrismaClient();
let server: http.Server | undefined;
let startedServer = false;

async function cleanup() {
  if (startedServer && server) {
    try {
      await new Promise<void>((resolve) => {
        server!.close(() => resolve());
      });
    } catch (e) {}
  }
  try {
    await prisma.$disconnect();
  } catch (e) {}
  try {
    await RedisConnectionManager.disconnect();
  } catch (e) {}
  
  // Clear any dangling timers from engines
  let id = setTimeout(() => {}, 0);
  while ((id as any) > 0) {
    clearTimeout(id);
    (id as any)--;
  }
}

process.on("uncaughtException", async (err)=>{
   console.error(err);
   await cleanup();
   process.exit(1);
});

process.on("unhandledRejection", async (err)=>{
   console.error(err);
   await cleanup();
   process.exit(1);
});

async function run() {
  try {
    let backendRunning = false;

try {
  const health = await fetch('http://localhost:3000/health/live');
  backendRunning = health.ok;
} catch {
  backendRunning = false;
}

if (backendRunning) {
  console.log('Using existing backend on port 3000');
} else {
  server = app.listen(3000, () => {
    console.log('Test HTTP server started on port 3000');
  });
  startedServer = true;
}

    const user = await prisma.user.findFirst();
    const agent = await prisma.agent.findFirst();

    if (!user || !agent) {
      throw new Error('No user or agent found. Please seed DB.');
    }

    // Ensure 'chat:create' permission exists in DB
    await prisma.permission.upsert({
      where: { name: 'chat:create' },
      update: {},
      create: {
        name: 'chat:create',
        resource: 'chat',
        action: 'create',
        category: 'Chat'
      }
    });

    // Connect all permissions to user's role to prevent 403
    const allPermissions = await prisma.permission.findMany();
    await prisma.role.update({
      where: { id: user.roleId },
      data: {
        permissions: {
          connect: allPermissions.map(p => ({ id: p.id }))
        }
      }
    });

    const sessionService = new (require('./src/modules/auth/services/session.service').SessionService)();
    const jwtEngine = new (require('./src/modules/auth/engine/jwt.engine').JWTEngine)();

    // Create session in Redis/DB
    const session = await sessionService.createSession(user.id, '127.0.0.1', 'Verify-Chat-Client');

    // Create a valid JWT
    const token = await jwtEngine.generateAccessToken({
      userId: user.id,
      sessionId: session.id,
      organizationId: user.organizationId
    });

    // Create a new Conversation for testing
    const conversation = await prisma.conversation.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        agentId: agent.id,
        status: 'ACTIVE'
      }
    });

    console.log(`Using User: ${user.email}, Agent: ${agent.name}, Conversation: ${conversation.id}`);
    console.log('Sending request to /api/v1/chat/completions...');

    const response = await fetch('http://localhost:3000/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agentId: agent.id,
        conversationId: conversation.id,
        message: 'What is Nexora AI?'
      })
    });

    if (!response.ok) {
      console.log('Error Status:', response.status);
      console.log('Error Body:', await response.text());
      throw new Error('Request failed');
    }

    console.log('--- STREAM STARTED ---');

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.replace('data: ', '');
          if (data === '[DONE]') {
            console.log('\n--- STREAM COMPLETED ---');
          } else {
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'token') {
                process.stdout.write(parsed.content);
              } else if (parsed.type === 'sources') {
                console.log('\n\n[SOURCES]');
                console.log(JSON.stringify(parsed.content, null, 2));
              } else if (parsed.type === 'metrics') {
                console.log('\n\n[METRICS]');
                console.log(JSON.stringify(parsed.content, null, 2));
              } else if (parsed.type === 'error') {
                console.error('\n\n[ERROR]', parsed.content);
              }
            } catch (err) {
              console.log('Raw Data:', data);
            }
          }
        }
      }
    }

    console.log('\nAll Chat verification scenarios PASS');
    await cleanup();
    process.exit(0);
  } catch (err: any) {
    console.error('Error:', err);
    await cleanup();
    process.exit(1);
  }
}

run().catch(async (e) => {
  console.error(e);
  await cleanup();
  process.exit(1);
});
