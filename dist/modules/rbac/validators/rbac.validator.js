"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignRoleSchema = exports.assignPermissionSchema = exports.updateRoleSchema = exports.createRoleSchema = void 0;
const zod_1 = require("zod");
exports.createRoleSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Role name must be at least 2 characters'),
        description: zod_1.z.string().optional(),
    })
});
exports.updateRoleSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).optional(),
        description: zod_1.z.string().optional(),
    })
});
exports.assignPermissionSchema = zod_1.z.object({
    body: zod_1.z.object({
        permissionId: zod_1.z.string().uuid('Invalid permission ID format')
    })
});
exports.assignRoleSchema = zod_1.z.object({
    body: zod_1.z.object({
        roleId: zod_1.z.string().uuid('Invalid role ID format')
    })
});
