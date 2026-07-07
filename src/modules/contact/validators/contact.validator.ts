import { z } from 'zod';

export const contactSubmissionSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    company: z.string().optional(),
    subject: z.string().min(1, 'Subject is required').max(200),
    message: z.string().min(1, 'Message is required').max(5000),
    honeypot: z.string().optional()
  })
});
