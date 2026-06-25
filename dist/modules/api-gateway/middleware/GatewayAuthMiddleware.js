"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayAuthMiddleware = void 0;
const common_1 = require("@nestjs/common");
const ApiKeyEngine_1 = require("../engine/ApiKeyEngine");
let GatewayAuthMiddleware = class GatewayAuthMiddleware {
    apiKeyEngine;
    constructor(apiKeyEngine) {
        this.apiKeyEngine = apiKeyEngine;
    }
    async use(req, res, next) {
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ent_')) {
            const key = authHeader.replace('Bearer ', '');
            const valid = await this.apiKeyEngine.validateKey(key);
            if (valid) {
                req.apiKey = valid;
                return next();
            }
        }
        return res.status(401).json({ error: 'Unauthorized' });
    }
};
exports.GatewayAuthMiddleware = GatewayAuthMiddleware;
exports.GatewayAuthMiddleware = GatewayAuthMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ApiKeyEngine_1.ApiKeyEngine])
], GatewayAuthMiddleware);
