"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogger = void 0;
const logger_1 = __importDefault(require("../logger/logger"));
const requestContext_1 = require("../context/requestContext");
class AuditLogger {
    static log(action, resource, details = {}) {
        const context = (0, requestContext_1.getRequestContext)();
        logger_1.default.info({
            audit: true,
            action,
            resource,
            userId: context?.userId,
            organizationId: context?.organizationId,
            requestId: context?.requestId,
            ...details,
        }, "Audit: " + action + " on " + resource);
    }
}
exports.AuditLogger = AuditLogger;
