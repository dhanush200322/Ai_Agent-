"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAgentSchema = exports.createAgentSchema = void 0;
const zod_1 = require("zod");
exports.createAgentSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
        slug: zod_1.z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
        description: zod_1.z.string().optional(),
        model: zod_1.z.string().min(1, 'Model is required'),
        systemPrompt: zod_1.z.string().optional(),
        temperature: zod_1.z.preprocess((val) => Number(val), zod_1.z.number().min(0).max(2).optional()),
        topP: zod_1.z.preprocess((val) => Number(val), zod_1.z.number().min(0).max(1).optional()),
        maxTokens: zod_1.z.preprocess((val) => Number(val), zod_1.z.number().min(1).optional()),
        visibility: zod_1.z.enum(['PRIVATE', 'ORGANIZATION', 'PUBLIC']).optional(),
    })
});
exports.updateAgentSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).optional(),
        description: zod_1.z.string().optional(),
        model: zod_1.z.string().min(1).optional(),
        systemPrompt: zod_1.z.string().optional(),
        temperature: zod_1.z.preprocess((val) => Number(val), zod_1.z.number().min(0).max(2).optional()),
        topP: zod_1.z.preprocess((val) => Number(val), zod_1.z.number().min(0).max(1).optional()),
        maxTokens: zod_1.z.preprocess((val) => Number(val), zod_1.z.number().min(1).optional()),
        visibility: zod_1.z.enum(['PRIVATE', 'ORGANIZATION', 'PUBLIC']).optional(),
        status: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
    })
});
