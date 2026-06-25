"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    static success(data, message = 'Success', requestId) {
        return {
            success: true,
            message,
            data,
            timestamp: new Date().toISOString(),
            ...(requestId && { requestId }),
        };
    }
    static error(error, message = 'Failure', requestId) {
        return {
            success: false,
            message,
            error,
            timestamp: new Date().toISOString(),
            ...(requestId && { requestId }),
        };
    }
}
exports.ApiResponse = ApiResponse;
