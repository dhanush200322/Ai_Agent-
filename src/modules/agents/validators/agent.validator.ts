import { z } from 'zod';

export const createAgentSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
    description: z.string().optional(),
    model: z.string().min(1, 'Model is required'),
    systemPrompt: z.string().optional(),
    temperature: z.preprocess((val) => Number(val), z.number().min(0).max(2).optional()),
    topP: z.preprocess((val) => Number(val), z.number().min(0).max(1).optional()),
    maxTokens: z.preprocess((val) => Number(val), z.number().min(1).optional()),
    visibility: z.enum(['PRIVATE', 'ORGANIZATION', 'PUBLIC']).optional(),
    themeConfig: z.any().optional(),
  })
});

export const updateAgentSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    model: z.string().min(1).optional(),
    systemPrompt: z.string().optional(),
    temperature: z.preprocess((val) => Number(val), z.number().min(0).max(2).optional()),
    topP: z.preprocess((val) => Number(val), z.number().min(0).max(1).optional()),
    maxTokens: z.preprocess((val) => Number(val), z.number().min(1).optional()),
    visibility: z.enum(['PRIVATE', 'ORGANIZATION', 'PUBLIC']).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
    themeConfig: z.any().optional(),
  })
});
