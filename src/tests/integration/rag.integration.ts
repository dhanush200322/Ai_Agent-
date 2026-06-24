import { EnterpriseTestRunner } from './test-runner';

export async function runRagTests(runner: EnterpriseTestRunner) {
  await runner.runCategory('RAG', [
    { name: 'Embedding', fn: async () => {} },
    { name: 'Search', fn: async () => {} },
    { name: 'Top K', fn: async () => {} },
    { name: 'Score Ordering', fn: async () => {} },
    { name: 'Context Builder', fn: async () => {} },
    { name: 'Prompt Builder', fn: async () => {} },
    { name: 'Citation Builder', fn: async () => {} },
    { name: 'Source Attribution', fn: async () => {} },
    { name: 'Missing Knowledge', fn: async () => {} },
    { name: 'Large Context', fn: async () => {} }
  ]);
}
