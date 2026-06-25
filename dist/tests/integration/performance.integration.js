"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPerformanceTests = runPerformanceTests;
async function runPerformanceTests(runner) {
    await runner.runCategory('Performance', [
        { name: 'Authentication Time', fn: async () => { } },
        { name: 'Embedding Time', fn: async () => { } },
        { name: 'Vector Search Time', fn: async () => { } },
        { name: 'Planner Time', fn: async () => { } },
        { name: 'Tool Execution Time', fn: async () => { } },
        { name: 'Workflow Time', fn: async () => { } },
        { name: 'Memory Time', fn: async () => { } },
        { name: 'RAG Time', fn: async () => { } },
        { name: 'Streaming Latency', fn: async () => { } },
        { name: 'End-to-End Response Time', fn: async () => { } },
        { name: 'CPU Usage', fn: async () => { } },
        { name: 'Memory Usage', fn: async () => { } },
        { name: 'Garbage Collection', fn: async () => { } },
        { name: 'Database Queries', fn: async () => { } },
        { name: 'Qdrant Queries', fn: async () => { } }
    ]);
}
