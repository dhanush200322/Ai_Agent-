// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import { initializeNodeRegistry } from './src/modules/workflows/nodes';
import { WorkflowService } from './src/modules/workflows/services/workflow.service';
import { ExecutionService } from './src/modules/workflows/services/execution.service';

const prisma = new PrismaClient();
const workflowService = new WorkflowService();
const executionService = new ExecutionService();

async function runDemo() {
  console.log('🚀 Initializing Workflow Engine Demo...\n');
  initializeNodeRegistry();

  // 1. Setup Data
  const org = await prisma.organization.create({ data: { name: 'Demo Org', slug: 'demo-org-' + Date.now() } });
  const role = await prisma.role.create({ data: { name: 'Admin', organizationId: org.id } });
  const user = await prisma.user.create({ data: { firstName: 'Demo', lastName: 'User', email: `demo-${Date.now()}@test.com`, passwordHash: 'hash', roleId: role.id, organizationId: org.id }});

  // 2. Create Workflow
  console.log('📦 Creating Workflow...');
  const wf = await workflowService.createWorkflow(org.id, user.id, 'Greeting AI Workflow', 'greeting-ai');

  // 3. Define DAG (JSON)
  console.log('🏗️ Defining DAG (Trigger -> Delay -> AI -> End)...');
  const nodes = [
    { id: 'start', type: 'trigger', label: 'Start Trigger', config: {} },
    { id: 'wait', type: 'delay', label: 'Hold 1 Sec', config: { delayMs: '1000' } },
    { id: 'ai', type: 'ai', label: 'Generate Greeting', config: { prompt: 'Write a very short 1 sentence funny greeting for {{execution.userName}}.' } }
  ];
  
  const edges = [
    { id: 'e1', source: 'start', target: 'wait' },
    { id: 'e2', source: 'wait', target: 'ai' }
  ];

  const version = await workflowService.createVersion(wf.id, nodes, edges);
  await workflowService.publishVersion(version.id);

  // 4. Execute
  console.log('⚡ Starting Execution Engine...');
  const initialVariables = { userName: 'Commander Shepard' };
  console.log('💉 Injecting Variables:', initialVariables);

  const execution = await executionService.startExecution(wf.id, initialVariables);

  console.log(`\n🔄 Execution [${execution.id}] is RUNNING asynchronously.\n`);

  // 5. Poll for completion (for demo purposes)
  let currentStatus = 'PENDING';
  let attempt = 0;
  
  while (currentStatus === 'PENDING' || currentStatus === 'RUNNING') {
    await new Promise(r => setTimeout(r, 500));
    const ex = await prisma.workflowExecution.findUnique({ where: { id: execution.id }, include: { logs: { orderBy: { startedAt: 'asc' } } } });
    currentStatus = ex!.status;
    
    console.clear();
    console.log('--- LIVE EXECUTION LOGS ---');
    console.log(`Status: ${currentStatus}`);
    
    ex!.logs.forEach(log => {
      let icon = '⏳';
      if (log.status === 'COMPLETED') icon = '✅';
      if (log.status === 'FAILED') icon = '❌';
      
      console.log(`${icon} Node [${log.nodeType}]: ${log.status} (Duration: ${log.duration || '<1'}ms)`);
      if (log.output) console.log(`   Output: ${log.output}`);
      if (log.error) console.log(`   Error: ${log.error}`);
    });
    
    attempt++;
    if (attempt > 20) break; // safety
  }

  console.log('\n🎉 Workflow Demo Finished!');
}

runDemo().catch(e => {
  console.error('\n❌ Demo Failed:', e.message);
  process.exit(1);
});
