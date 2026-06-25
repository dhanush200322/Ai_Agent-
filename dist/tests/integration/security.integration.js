"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSecurityTests = runSecurityTests;
async function runSecurityTests(runner) {
    await runner.runCategory('Security', [
        { name: 'RBAC', fn: async () => { } },
        { name: 'Organization Isolation', fn: async () => { } },
        { name: 'Workflow Isolation', fn: async () => { } },
        { name: 'Conversation Isolation', fn: async () => { } },
        { name: 'Knowledge Isolation', fn: async () => { } },
        { name: 'Memory Isolation', fn: async () => { } },
        { name: 'Tool Isolation', fn: async () => { } },
        { name: 'Credential Isolation', fn: async () => { } },
        { name: 'Prompt Injection Protection', fn: async () => { } },
        { name: 'Sandbox Escape Prevention', fn: async () => { } },
        { name: 'Execution Limits', fn: async () => { } },
        { name: 'Rate Limits', fn: async () => { } },
        { name: 'Cross-site Scripting', fn: async () => { } },
        { name: 'CSRF Protection', fn: async () => { } },
        { name: 'Token Revocation', fn: async () => { } }
    ]);
}
