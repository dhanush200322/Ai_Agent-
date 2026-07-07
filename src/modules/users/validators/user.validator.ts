import { z } from 'zod';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const inviteUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    roleName: z.string().min(1, 'Role name is required')
  })
});

export const acceptInviteSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    password: z.string().regex(passwordRegex, 'Password must be at least 8 characters, contain an uppercase letter, lowercase letter, a number, and a special character'),
  })
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
  })
});

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().optional()
  })
});
