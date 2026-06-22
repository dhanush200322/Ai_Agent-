import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';
import { ValidationError } from '../shared/errors/AppError';

export const validate = (schema: ZodObject<any, any> | any) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    console.log("[DEBUG validate] req.file =", req.file);
    console.log("[DEBUG validate] req.body =", req.body);
    console.log("[DEBUG validate] req.params =", req.params);
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(error); // Passes to global error handler to format Zod errors
      } else {
        next(new ValidationError('Invalid request data'));
      }
    }
  };
};
