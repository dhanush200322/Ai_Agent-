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
var PluginEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginEngine = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const SandboxEngine_1 = require("./SandboxEngine");
let PluginEngine = PluginEngine_1 = class PluginEngine {
    prisma;
    sandboxEngine;
    logger = new common_1.Logger(PluginEngine_1.name);
    constructor(prisma, sandboxEngine) {
        this.prisma = prisma;
        this.sandboxEngine = sandboxEngine;
    }
    async initialize() {
        this.logger.log('Initializing PluginEngine...');
    }
    async installPlugin(organizationId, pluginId, version, userId) {
        this.logger.log(`Installing plugin ${pluginId} version ${version} for org ${organizationId}`);
        return this.prisma.pluginInstallation.create({
            data: {
                pluginId,
                organizationId,
                installedById: userId,
                installedVersion: version,
                lifecycleState: 'INSTALLED',
            }
        });
    }
    async uninstallPlugin(organizationId, installationId) {
        this.logger.log(`Uninstalling plugin installation ${installationId} for org ${organizationId}`);
        await this.prisma.pluginInstallation.delete({
            where: { id: installationId, organizationId }
        });
    }
    async executePluginFunction(installationId, funcName, args) {
        this.logger.log(`Executing plugin function ${funcName} for installation ${installationId}`);
        // Use sandbox to execute
        return this.sandboxEngine.executeInSandbox(installationId, funcName, args);
    }
    async healthCheck() {
        return { status: 'HEALTHY' };
    }
};
exports.PluginEngine = PluginEngine;
exports.PluginEngine = PluginEngine = PluginEngine_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [client_1.PrismaClient,
        SandboxEngine_1.SandboxEngine])
], PluginEngine);
