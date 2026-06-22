import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function run() {
  try {
    const user = await prisma.user.findFirst();
    const agent = await prisma.agent.findFirst();

    if (!user || !agent) {
      console.log('No user or agent found. Please seed DB.');
      return;
    }

    // Create a valid JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_ACCESS_SECRET as string,
      { expiresIn: '1h' }
    );

    console.log(`Using User: ${user.email}, Agent: ${agent.name}`);
    console.log('Sending request to /api/v1/chat/completions...');

    const response = await fetch('http://localhost:3000/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agentId: agent.id,
        message: 'What is Enterprise AI?'
      })
    });

    if (!response.ok) {
      console.log('Error Status:', response.status);
      console.log('Error Body:', await response.text());
      return;
    }

    console.log('--- STREAM STARTED ---');

    if (!response.body) {
      console.log('No response body');
      return;
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

    await prisma.$disconnect();
  } catch (err: any) {
    console.error('Error:', err);
    await prisma.$disconnect();
  }
}

run();
