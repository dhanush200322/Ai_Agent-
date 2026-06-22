import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../../../shared/errors/AppError';

const chatCompletionSchema = z.object({
  agentId: z.string().uuid(),
  conversationId: z.string().uuid(),
  message: z.string().min(1, 'Message is required'),
  knowledgeBaseIds: z.array(z.string().uuid()).optional(),
});

export const validateChatCompletion = (req: Request, _res: Response, next: NextFunction) => {
  try {
    chatCompletionSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = (error as any).errors.map((e: any) => e.message).join(', ');
      next(new AppError(`Validation failed: ${messages}`, 400));
    } else {
      next(error);
    }
  }
};
