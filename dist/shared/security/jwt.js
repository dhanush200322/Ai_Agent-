"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtHelper = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class JwtHelper {
    static sign(payload, secret, expiresIn) {
        return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: expiresIn });
    }
    static verify(token, secret) {
        return jsonwebtoken_1.default.verify(token, secret);
    }
}
exports.JwtHelper = JwtHelper;
