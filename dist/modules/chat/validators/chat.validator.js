"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateChatCompletion = void 0;
const zod_1 = require("zod");
const AppError_1 = require("../../../shared/errors/AppError");
const chatCompletionSchema = zod_1.z.object({
    agentId: zod_1.z.string().uuid(),
    conversationId: zod_1.z.string().uuid(),
    message: zod_1.z.string().min(1, 'Message is required'),
    knowledgeBaseIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
});
const validateChatCompletion = (req, _res, next) => {
    try {
        chatCompletionSchema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const messages = error.issues.map((e) => e.message).join(', ');
            next(new AppError_1.AppError(`Validation failed: ${messages}`, 400));
        }
        else {
            next(error);
        }
    }
};
exports.validateChatCompletion = validateChatCompletion;
