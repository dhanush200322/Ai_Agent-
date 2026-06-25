"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionEngine = void 0;
const crypto = __importStar(require("crypto"));
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
class EncryptionEngine {
    masterKeys = new Map();
    currentKeyVersion;
    constructor() {
        // In a real system, you'd load multiple keys. For now, we load V1 from env.
        const keyStr = process.env.VAULT_MASTER_KEY || '0123456789abcdef0123456789abcdef';
        if (keyStr.length !== 32) {
            throw new Error('VAULT_MASTER_KEY must be exactly 32 characters for AES-256');
        }
        this.currentKeyVersion = 1;
        this.masterKeys.set(1, Buffer.from(keyStr, 'utf-8'));
    }
    encrypt(plainText) {
        const iv = crypto.randomBytes(IV_LENGTH);
        const key = this.masterKeys.get(this.currentKeyVersion);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        let encrypted = cipher.update(plainText, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        const authTag = cipher.getAuthTag();
        return {
            encryptedValue: encrypted,
            iv: iv.toString('base64'),
            authTag: authTag.toString('base64'),
            keyVersion: this.currentKeyVersion,
        };
    }
    decrypt(encryptedData) {
        const key = this.masterKeys.get(encryptedData.keyVersion);
        if (!key) {
            throw new Error(`Master key version ${encryptedData.keyVersion} not found.`);
        }
        const iv = Buffer.from(encryptedData.iv, 'base64');
        const authTag = Buffer.from(encryptedData.authTag, 'base64');
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedData.encryptedValue, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}
exports.EncryptionEngine = EncryptionEngine;
