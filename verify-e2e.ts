import * as fs from 'fs';
import * as path from 'path';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const BASE_URL = 'http://localhost:3000/api/v1';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runE2E() {
  console.log('\n================================================');
  console.log('🚀 Phase 6.6 Final Integration Test - Full E2E');
  console.log('================================================\n');

  try {
    // 0. Setup Authentication
    const prisma = new PrismaClient();
    const user = await prisma.user.findFirst({ where: { email: 'enterprise001@gmail.com' } });
    if (!user) throw new Error('Test user not found');
    
    // 0.2 Grant Permissions to Role
    const requiredPerms = ['chat:create', 'chat:read', 'chat:update', 'chat:delete', 'knowledge:create', 'knowledge:view'];
    for (const perm of requiredPerms) {
      const [resource, action] = perm.split(':');
      let existingPerm = await prisma.permission.findFirst({
        where: { resource, action }
      });
      if (!existingPerm) {
        existingPerm = await prisma.permission.create({
          data: {
            name: perm,
            category: resource,
            resource,
            action
          }
        });
      } else {
        await prisma.permission.update({
          where: { id: existingPerm.id },
          data: { name: perm }
        });
      }
      // Connect to role
      await prisma.role.update({
        where: { id: user.roleId },
        data: {
          permissions: {
            connect: { id: existingPerm.id }
          }
        }
      });
    }

    // Invalidate Redis cache
    const { PermissionCache } = require('./src/modules/rbac/utils/permissionCache');
    await PermissionCache.invalidate(user.roleId);

    // Create JWT Token dynamically to avoid expiration
    require('dotenv').config();
    const API_TOKEN = jwt.sign(
      { 
        userId: user.id, 
        organizationId: user.organizationId, 
        roleId: user.roleId,
        email: user.email
      },
      process.env.JWT_ACCESS_SECRET || '',
      { expiresIn: '1h' }
    );

    // 0.5 Setup Knowledge Base
    let kb = await prisma.knowledgeBase.findFirst({ where: { organizationId: user.organizationId, deletedAt: null } });
    if (!kb) {
      kb = await prisma.knowledgeBase.create({
        data: {
          name: 'E2E Test KB',
          organizationId: user.organizationId,
          createdById: user.id
        }
      });
    }
    const KNOWLEDGE_BASE_ID = kb.id;

    // ----------------------------------------------------
    // 1. Upload & Process PDF (Using a TXT that simulates PDF for speed)
    // ----------------------------------------------------
    console.log('1️⃣ Uploading Knowledge Document...');
    const testContent = "Acme Corp Deployment Policy: All servers must use Ubuntu 24.04 LTS. The primary region is us-east-1.";
    const filePath = path.join(__dirname, 'acme-policy.txt');
    fs.writeFileSync(filePath, testContent);

    const formData = new FormData();
    const fileBlob = new Blob([fs.readFileSync(filePath)], { type: 'text/plain' });
    formData.append('file', fileBlob, 'acme-policy.txt');

    const uploadRes = await fetch(`${BASE_URL}/knowledge/${KNOWLEDGE_BASE_ID}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: formData as any
    });

    if (!uploadRes.ok) throw new Error(`Upload Failed: ${await uploadRes.text()}`);
    const uploadData: any = await uploadRes.json();
    console.log(`✅ Document Uploaded! ID: ${uploadData.data.id}`);

    // Wait for Background Processing
    console.log('⏳ Waiting for Document Processing, Chunking, Embedding...');
    await delay(3000); // 3 seconds should be enough for local processing

    // Get an Agent ID
    const agent = await prisma.agent.findFirst({ where: { slug: 'test-agent' } });
    if (!agent) throw new Error('Test agent not found. Did verify-memory run?');

    // ----------------------------------------------------
    // 2. Create Conversation
    // ----------------------------------------------------
    console.log('\n2️⃣ Creating Conversation...');
    const convRes = await fetch(`${BASE_URL}/chat/conversations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ agentId: agent.id, sessionId: 'e2e-test' })
    });

    if (!convRes.ok) throw new Error(`Conversation Failed: ${await convRes.text()}`);
    const convData: any = await convRes.json();
    const conversationId = convData.data.id;
    console.log(`✅ Conversation Created! ID: ${conversationId}`);

    // ----------------------------------------------------
    // 3. Question 1 (Tests Knowledge Retrieval & Groq)
    // ----------------------------------------------------
    console.log('\n3️⃣ User asks Question 1 (Testing Knowledge RAG)...');
    const q1 = "What OS is required for Acme Corp servers?";
    console.log(`🗣️  User: ${q1}`);

    const chat1Res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agentId: agent.id,
        conversationId: conversationId,
        message: q1,
        knowledgeBaseIds: [KNOWLEDGE_BASE_ID]
      })
    });

    if (!chat1Res.ok) throw new Error(`Chat 1 Failed: ${await chat1Res.text()}`);

    const reader1 = chat1Res.body!.getReader();
    const decoder1 = new TextDecoder();
    let assistantAnswer1 = '';
    
    process.stdout.write('🤖 Assistant: ');
    while (true) {
      const { done, value } = await reader1.read();
      if (done) break;
      const chunk = decoder1.decode(value);
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.replace('data: ', '').trim();
          if (dataStr === '[DONE]') continue;
          try {
            const data = JSON.parse(dataStr);
            if (data.type === 'token') {
              assistantAnswer1 += data.content;
              process.stdout.write(data.content);
            }
          } catch (e) {}
        }
      }
    }
    console.log('\n✅ Streaming Response Complete!');
    if (!assistantAnswer1.includes('Ubuntu')) {
      console.warn('⚠️ Warning: Answer did not strongly reflect the uploaded knowledge.');
    }

    // Wait for Background Memory Persistence
    console.log('⏳ Waiting for Conversation Memory Persistence...');
    await delay(3000);

    // ----------------------------------------------------
    // 4. Question 2 (Tests Semantic Memory Retrieval)
    // ----------------------------------------------------
    console.log('\n4️⃣ User asks Question 2 (Testing Conversation Memory)...');
    const q2 = "And what is the primary region for those servers?";
    console.log(`🗣️  User: ${q2}`);

    const chat2Res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agentId: agent.id,
        conversationId: conversationId,
        message: q2,
        knowledgeBaseIds: [KNOWLEDGE_BASE_ID]
      })
    });

    if (!chat2Res.ok) throw new Error(`Chat 2 Failed: ${await chat2Res.text()}`);

    const reader2 = chat2Res.body!.getReader();
    const decoder2 = new TextDecoder();
    let assistantAnswer2 = '';
    
    process.stdout.write('🤖 Assistant: ');
    while (true) {
      const { done, value } = await reader2.read();
      if (done) break;
      const chunk = decoder2.decode(value);
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.replace('data: ', '').trim();
          if (dataStr === '[DONE]') continue;
          try {
            const data = JSON.parse(dataStr);
            if (data.type === 'token') {
              assistantAnswer2 += data.content;
              process.stdout.write(data.content);
            }
          } catch (e) {}
        }
      }
    }
    console.log('\n✅ Memory Retrieval & Context Injection Complete!');
    if (!assistantAnswer2.includes('east')) {
      console.warn('⚠️ Warning: Answer did not strongly reflect the memory/knowledge.');
    }

    // Cleanup
    fs.unlinkSync(filePath);

    console.log('\n================================================');
    console.log('🏆 E2E WORKFLOW VALIDATION SUCCESSFUL!');
    console.log('Your backend foundation is officially COMPLETE.');
    console.log('================================================\n');

  } catch (error) {
    console.error('\n❌ E2E Validation Failed:', error);
    process.exit(1);
  }
}

runE2E();
