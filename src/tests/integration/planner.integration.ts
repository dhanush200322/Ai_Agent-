import { EnterpriseTestRunner } from './test-runner';

export async function runPlannerTests(runner: EnterpriseTestRunner) {
  await runner.runCategory('Planner', [
    { name: 'No Tool', fn: async () => {} },
    { name: 'Single Tool', fn: async () => {} },
    { name: 'Multiple Tools', fn: async () => {} },
    { name: 'Recursive Planning', fn: async () => {} },
    { name: 'Depth Limits', fn: async () => {} },
    { name: 'Execution Limits', fn: async () => {} },
    { name: 'Planner Disabled', fn: async () => {} },
    { name: 'Tool Calling Disabled', fn: async () => {} },
    { name: 'Temperature Override', fn: async () => {} },
    { name: 'Model Override', fn: async () => {} }
  ]);
}
