"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactSubmissionSchema = void 0;
const zod_1 = require("zod");
exports.contactSubmissionSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Name is required').max(100),
        email: zod_1.z.string().email('Invalid email address'),
        phone: zod_1.z.string().optional(),
        company: zod_1.z.string().optional(),
        subject: zod_1.z.string().min(1, 'Subject is required').max(200),
        message: zod_1.z.string().min(1, 'Message is required').max(5000),
        honeypot: zod_1.z.string().optional()
    })
});
