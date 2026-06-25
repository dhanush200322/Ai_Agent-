"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const AppError_1 = require("../shared/errors/AppError");
const validate = (schema) => {
    return async (req, _res, next) => {
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
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                next(error); // Passes to global error handler to format Zod errors
            }
            else {
                next(new AppError_1.ValidationError('Invalid request data'));
            }
        }
    };
};
exports.validate = validate;
