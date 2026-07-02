"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TransformationEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformationEngine = void 0;
const prisma_1 = require("../../../shared/prisma");
const common_1 = require("@nestjs/common");
let TransformationEngine = TransformationEngine_1 = class TransformationEngine {
    logger = new common_1.Logger(TransformationEngine_1.name);
    prisma = prisma_1.prisma;
    async transformRequest(routeId, payload) {
        this.logger.debug(`Applying REQUEST transformations for route ${routeId}`);
        const transforms = await this.prisma.apiTransformation.findMany({
            where: { routeId, type: 'REQUEST' }
        });
        let transformed = { ...payload };
        for (const tx of transforms) {
            if (tx.config?.rename) {
                const { from, to } = tx.config.rename;
                if (transformed[from]) {
                    transformed[to] = transformed[from];
                    delete transformed[from];
                }
            }
        }
        return transformed;
    }
    async transformResponse(routeId, payload) {
        this.logger.debug(`Applying RESPONSE transformations for route ${routeId}`);
        return payload;
    }
};
exports.TransformationEngine = TransformationEngine;
exports.TransformationEngine = TransformationEngine = TransformationEngine_1 = __decorate([
    (0, common_1.Injectable)()
], TransformationEngine);
