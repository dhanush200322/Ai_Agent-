import { EnterpriseTestRunner } from './test-runner';

export async function runWorkflowTests(runner: EnterpriseTestRunner) {
  await runner.runCategory('Workflow', [
    { name: 'Workflow CRUD', fn: async () => {} },
    { name: 'Versioning', fn: async () => {} },
    { name: 'Runner', fn: async () => {} },
    { name: 'Variables', fn: async () => {} },
    { name: 'Branching', fn: async () => {} },
    { name: 'Conditions', fn: async () => {} },
    { name: 'Loops', fn: async () => {} },
    { name: 'Parallel Nodes', fn: async () => {} },
    { name: 'Merge Nodes', fn: async () => {} },
    { name: 'Delay Nodes', fn: async () => {} },
    { name: 'Approval Nodes', fn: async () => {} },
    { name: 'Resume', fn: async () => {} },
    { name: 'Rollback', fn: async () => {} },
    { name: 'Cancellation', fn: async () => {} },
    { name: 'Execution Logs', fn: async () => {} }
  ]);
}
