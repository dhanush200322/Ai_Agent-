"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferOwnershipSchema = exports.updateOrganizationSchema = void 0;
const zod_1 = require("zod");
exports.updateOrganizationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters').optional(),
        website: zod_1.z.union([zod_1.z.string().url('Invalid URL'), zod_1.z.literal('')]).optional(),
        industry: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
        timezone: zod_1.z.string().optional(),
    })
});
exports.transferOwnershipSchema = zod_1.z.object({
    body: zod_1.z.object({
        newOwnerId: zod_1.z.string().uuid('Invalid user ID format')
    })
});
