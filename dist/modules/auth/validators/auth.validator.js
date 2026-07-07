"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        organizationName: zod_1.z.string().min(2, 'Organization name must be at least 2 characters'),
        organizationSlug: zod_1.z.string().min(2, 'Organization slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
        firstName: zod_1.z.string().min(1, 'First name is required'),
        lastName: zod_1.z.string().min(1, 'Last name is required'),
        email: zod_1.z.string().email('Invalid email address').trim().toLowerCase(),
        password: zod_1.z.string().regex(passwordRegex, 'Password must be at least 8 characters, contain an uppercase letter, lowercase letter, a number, and a special character'),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address').trim().toLowerCase(),
        password: zod_1.z.string().min(1, 'Password is required'),
    }),
});
exports.refreshTokenSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
    }),
});
