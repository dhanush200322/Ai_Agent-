"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionCache = void 0;
const logger_1 = __importDefault(require("../../../shared/logger/logger"));
class PermissionCache {
    static cache = new Map();
    static async get(roleId) {
        const permissions = this.cache.get(roleId);
        return permissions || null;
    }
    static async set(roleId, permissions) {
        this.cache.set(roleId, permissions);
    }
    static async invalidate(roleId) {
        this.cache.delete(roleId);
        logger_1.default.debug({ roleId }, 'Permission cache invalidated');
    }
}
exports.PermissionCache = PermissionCache;
