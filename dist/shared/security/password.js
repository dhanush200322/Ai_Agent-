"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordHelper = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
class PasswordHelper {
    static async hash(password, rounds = 12) {
        return bcrypt_1.default.hash(password, rounds);
    }
    static async compare(plain, hash) {
        return bcrypt_1.default.compare(plain, hash);
    }
}
exports.PasswordHelper = PasswordHelper;
