import { z } from 'zod';

export const createKnowledgeBaseSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional(),
  })
});

export const updateKnowledgeBaseSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
  })
});

export const documentParamsSchema = z.object({
  params: z.object({
    knowledgeBaseId: z.string().uuid('Invalid Knowledge Base ID format').optional(),
    id: z.string().uuid('Invalid Document ID format').optional(),
  })
});
