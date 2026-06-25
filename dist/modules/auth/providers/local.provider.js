"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalProvider = void 0;
class LocalProvider {
    async authenticate(credentials) {
        // Basic local auth logic using bcrypt (to be implemented)
        throw new Error('Method not implemented.');
    }
    async refresh(token) {
        throw new Error('Method not implemented.');
    }
    async revoke(token) {
        throw new Error('Method not implemented.');
    }
    async verify(token) {
        throw new Error('Method not implemented.');
    }
    async logout(token) {
        throw new Error('Method not implemented.');
    }
}
exports.LocalProvider = LocalProvider;
