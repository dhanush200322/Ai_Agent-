"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runKnowledgeTests = runKnowledgeTests;
async function runKnowledgeTests(runner) {
    await runner.runCategory('Knowledge', [
        { name: 'Upload', fn: async () => { } },
        { name: 'Chunking', fn: async () => { } },
        { name: 'Embedding', fn: async () => { } },
        { name: 'Qdrant Storage', fn: async () => { } },
        { name: 'Similarity Search', fn: async () => { } },
        { name: 'Metadata', fn: async () => { } },
        { name: 'Organization Filter', fn: async () => { } },
        { name: 'Large Documents', fn: async () => { } },
        { name: 'Duplicate Upload', fn: async () => { } },
        { name: 'Delete', fn: async () => { } }
    ]);
}
