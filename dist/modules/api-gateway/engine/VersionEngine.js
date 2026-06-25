"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var VersionEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionEngine = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let VersionEngine = VersionEngine_1 = class VersionEngine {
    logger = new common_1.Logger(VersionEngine_1.name);
    prisma = new client_1.PrismaClient();
    async negotiateVersion(requestedVersion) {
        this.logger.debug(`Negotiating API version: ${requestedVersion}`);
        const version = await this.prisma.apiVersion.findFirst({
            where: { version: requestedVersion }
        });
        if (!version) {
            throw new Error(`API Version ${requestedVersion} not found`);
        }
        if (version.status === 'RETIRED') {
            throw new Error(`API Version ${requestedVersion} is retired`);
        }
        return version;
    }
};
exports.VersionEngine = VersionEngine;
exports.VersionEngine = VersionEngine = VersionEngine_1 = __decorate([
    (0, common_1.Injectable)()
], VersionEngine);
