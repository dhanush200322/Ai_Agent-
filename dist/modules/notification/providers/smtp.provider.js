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
exports.SMTPProvider = void 0;
const nodemailer = __importStar(require("nodemailer"));
class SMTPProvider {
    transporter = null;
    config = null;
    constructor(config) {
        this.config = config;
        if (config && config.host && config.host !== 'mock-host') {
            this.transporter = nodemailer.createTransport({
                host: config.host,
                port: config.port,
                secure: config.secure,
                auth: {
                    user: config.user,
                    pass: config.pass,
                },
            });
        }
    }
    async send(options) {
        const startTime = Date.now();
        try {
            if (!this.transporter || this.config.host === 'mock-host') {
                // Check for simulated failure to test retry/failover logic
                if (this.config.simulateFailure || options.recipient.includes('fail')) {
                    throw new Error('SMTP connection timed out');
                }
                return {
                    success: true,
                    deliveryId: `smtp-${Math.random().toString(36).substring(2, 11)}`,
                    latency: Date.now() - startTime,
                };
            }
            const mailOptions = {
                from: this.config.from || 'noreply@enterprise.com',
                to: options.recipient,
                subject: options.subject || 'No Subject',
                html: options.body,
            };
            if (options.attachments && options.attachments.length > 0) {
                mailOptions.attachments = options.attachments.map(att => ({
                    filename: att.fileName,
                    path: att.filePath,
                }));
            }
            const info = await this.transporter.sendMail(mailOptions);
            return {
                success: true,
                deliveryId: info.messageId,
                latency: Date.now() - startTime,
            };
        }
        catch (error) {
            return {
                success: false,
                errorMessage: error.message,
                latency: Date.now() - startTime,
            };
        }
    }
    validate(config) {
        return !!(config && config.host && config.port);
    }
    async health() {
        if (!this.transporter || this.config.host === 'mock-host')
            return true;
        try {
            await this.transporter.verify();
            return true;
        }
        catch {
            return false;
        }
    }
    async status() {
        const isHealthy = await this.health();
        return isHealthy ? 'ACTIVE' : 'DEGRADED';
    }
}
exports.SMTPProvider = SMTPProvider;
