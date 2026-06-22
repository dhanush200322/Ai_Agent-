import { z } from 'zod';

export const updateOrganizationSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    website: z.string().url('Invalid URL').optional(),
    industry: z.string().optional(),
    country: z.string().optional(),
    timezone: z.string().optional(),
  })
});

export const transferOwnershipSchema = z.object({
  body: z.object({
    newOwnerId: z.string().uuid('Invalid user ID format')
  })
});
