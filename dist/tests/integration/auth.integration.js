"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAuthTests = runAuthTests;
async function runAuthTests(runner) {
    await runner.runCategory('Authentication', [
        { name: 'JWT Validation', fn: async () => { } },
        { name: 'Expired Token', fn: async () => { } },
        { name: 'Invalid Token', fn: async () => { } },
        { name: 'Missing Token', fn: async () => { } },
        { name: 'Permission Checks', fn: async () => { } },
        { name: 'Role Isolation', fn: async () => { } },
        { name: 'Organization Isolation', fn: async () => { } },
        { name: 'Cross Organization Access', fn: async () => { } },
        { name: 'Agent Ownership', fn: async () => { } },
        { name: 'Workflow Ownership', fn: async () => { } }
    ]);
}
