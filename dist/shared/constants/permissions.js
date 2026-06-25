"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PERMISSIONS = void 0;
exports.DEFAULT_PERMISSIONS = [
    { name: 'agent:create', resource: 'agent', action: 'create', category: 'Agent' },
    { name: 'agent:update', resource: 'agent', action: 'update', category: 'Agent' },
    { name: 'agent:delete', resource: 'agent', action: 'delete', category: 'Agent' },
    { name: 'agent:view', resource: 'agent', action: 'view', category: 'Agent' },
    { name: 'knowledge:create', resource: 'knowledge', action: 'create', category: 'Knowledge' },
    { name: 'knowledge:update', resource: 'knowledge', action: 'update', category: 'Knowledge' },
    { name: 'knowledge:delete', resource: 'knowledge', action: 'delete', category: 'Knowledge' },
    { name: 'knowledge:view', resource: 'knowledge', action: 'view', category: 'Knowledge' },
    { name: 'organization:view', resource: 'organization', action: 'view', category: 'Organization' },
    { name: 'organization:update', resource: 'organization', action: 'update', category: 'Organization' },
    { name: 'user:create', resource: 'user', action: 'create', category: 'User' },
    { name: 'user:update', resource: 'user', action: 'update', category: 'User' },
    { name: 'user:delete', resource: 'user', action: 'delete', category: 'User' },
    { name: 'role:update', resource: 'role', action: 'update', category: 'Role' },
    { name: 'billing:view', resource: 'billing', action: 'view', category: 'Billing' },
    { name: 'billing:update', resource: 'billing', action: 'update', category: 'Billing' },
    { name: 'settings:update', resource: 'settings', action: 'update', category: 'Settings' }
];
