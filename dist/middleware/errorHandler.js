"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const client_1 = require("@prisma/client");
const AppError_1 = require("../shared/errors/AppError");
const ApiResponse_1 = require("../shared/response/ApiResponse");
const logger_1 = __importDefault(require("../shared/logger/logger"));
const globalErrorHandler = (err, _req, res, _next) => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let errorDetails = process.env.NODE_ENV === 'production' ? undefined : err;
    const requestId = _req.reqId;
    if (err instanceof AppError_1.AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err.name === 'ZodError') {
        statusCode = 400;
        message = 'Validation Error';
        errorDetails = err.errors;
    }
    else if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        // Handle specific Prisma errors
        if (err.code === 'P2002') {
            statusCode = 409;
            message = 'A record with that unique field already exists';
        }
        else if (err.code === 'P2025') {
            statusCode = 404;
            message = 'Record not found';
        }
        else {
            statusCode = 400;
            message = 'Database request error';
        }
        errorDetails = process.env.NODE_ENV === 'production' ? undefined : err.meta;
    }
    else if (err instanceof client_1.Prisma.PrismaClientValidationError) {
        statusCode = 400;
        message = 'Database validation error';
    }
    else {
        logger_1.default.error({ err, requestId }, 'Unexpected Error');
    }
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
        errorDetails = undefined;
    }
    res.status(statusCode).json(ApiResponse_1.ApiResponse.error(errorDetails, message, requestId));
};
exports.globalErrorHandler = globalErrorHandler;
