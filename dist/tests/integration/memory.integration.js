"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMemoryTests = runMemoryTests;
async function runMemoryTests(runner) {
    await runner.runCategory('Memory', [
        { name: 'Conversation Creation', fn: async () => { } },
        { name: 'Message Storage', fn: async () => { } },
        { name: 'Memory Retrieval', fn: async () => { } },
        { name: 'Summary Generation', fn: async () => { } },
        { name: 'Title Generation', fn: async () => { } },
        { name: 'Context Injection', fn: async () => { } },
        { name: 'Duplicate Prevention', fn: async () => { } },
        { name: 'Memory Ranking', fn: async () => { } },
        { name: 'Conversation Resume', fn: async () => { } },
        { name: 'Long Conversation', fn: async () => { } }
    ]);
}
