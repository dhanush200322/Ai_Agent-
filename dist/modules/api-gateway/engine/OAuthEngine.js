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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var OAuthEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthEngine = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const crypto = __importStar(require("crypto"));
let OAuthEngine = OAuthEngine_1 = class OAuthEngine {
    logger = new common_1.Logger(OAuthEngine_1.name);
    prisma = new client_1.PrismaClient();
    async registerApplication(organizationId, name, redirectUris) {
        this.logger.debug(`Registering OAuth application ${name} for org ${organizationId}`);
        const clientId = crypto.randomBytes(16).toString('hex');
        const clientSecret = crypto.randomBytes(32).toString('hex');
        return this.prisma.developerOAuthApplication.create({
            data: {
                organizationId,
                name,
                clientId,
                clientSecret,
                redirectUris,
                scopes: ['read', 'write']
            }
        });
    }
    async validateClient(clientId, clientSecret) {
        const app = await this.prisma.developerOAuthApplication.findUnique({
            where: { clientId }
        });
        if (app && app.clientSecret === clientSecret && app.status === 'ACTIVE') {
            return app;
        }
        return null;
    }
};
exports.OAuthEngine = OAuthEngine;
exports.OAuthEngine = OAuthEngine = OAuthEngine_1 = __decorate([
    (0, common_1.Injectable)()
], OAuthEngine);
