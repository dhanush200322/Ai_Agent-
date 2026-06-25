"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentParamsSchema = exports.updateKnowledgeBaseSchema = exports.createKnowledgeBaseSchema = void 0;
const zod_1 = require("zod");
exports.createKnowledgeBaseSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
        description: zod_1.z.string().optional(),
    })
});
exports.updateKnowledgeBaseSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).optional(),
        description: zod_1.z.string().optional(),
    })
});
exports.documentParamsSchema = zod_1.z.object({
    params: zod_1.z.object({
        knowledgeBaseId: zod_1.z.string().uuid('Invalid Knowledge Base ID format').optional(),
        id: zod_1.z.string().uuid('Invalid Document ID format').optional(),
    })
});
