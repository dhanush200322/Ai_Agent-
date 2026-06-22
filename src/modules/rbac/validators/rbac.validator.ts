import { z } from 'zod';

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Role name must be at least 2 characters'),
    description: z.string().optional(),
  })
});

export const updateRoleSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
  })
});

export const assignPermissionSchema = z.object({
  body: z.object({
    permissionId: z.string().uuid('Invalid permission ID format')
  })
});

export const assignRoleSchema = z.object({
  body: z.object({
    roleId: z.string().uuid('Invalid role ID format')
  })
});
