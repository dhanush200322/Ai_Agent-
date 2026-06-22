import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../shared/errors/AppError';
import { ApiResponse } from '../shared/response/ApiResponse';
import logger from '../shared/logger/logger';

export const globalErrorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errorDetails: any = process.env.NODE_ENV === 'production' ? undefined : err;
  const requestId = _req.reqId;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation Error';
    errorDetails = err.errors;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle specific Prisma errors
    if (err.code === 'P2002') {
      statusCode = 409;
      message = 'A record with that unique field already exists';
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
    } else {
      statusCode = 400;
      message = 'Database request error';
    }
    errorDetails = process.env.NODE_ENV === 'production' ? undefined : err.meta;
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Database validation error';
  } else {
    logger.error({ err, requestId }, 'Unexpected Error');
  }

  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    errorDetails = undefined;
  }

  res.status(statusCode).json(ApiResponse.error(errorDetails, message, requestId));
};
