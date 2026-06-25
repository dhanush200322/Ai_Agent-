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
var ConnectorEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectorEngine = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let ConnectorEngine = ConnectorEngine_1 = class ConnectorEngine {
    prisma;
    logger = new common_1.Logger(ConnectorEngine_1.name);
    providers = new Map();
    constructor(prisma) {
        this.prisma = prisma;
    }
    async initialize() {
        this.logger.log('Initializing ConnectorEngine...');
    }
    registerProvider(slug, provider) {
        this.providers.set(slug, provider);
        this.logger.debug(`Registered provider implementation: ${slug}`);
    }
    getProvider(slug) {
        const provider = this.providers.get(slug);
        if (!provider) {
            throw new common_1.NotFoundException(`Provider ${slug} not found`);
        }
        return provider;
    }
    async executeAction(organizationId, connectorId, action, payload) {
        const connector = await this.prisma.connector.findUnique({
            where: { id: connectorId },
        });
        if (!connector)
            throw new common_1.NotFoundException('Connector not found');
        if (connector.organizationId !== organizationId)
            throw new common_1.NotFoundException('Unauthorized connector access');
        // Resolve provider from connector... in real implementation would fetch provider string
        // Here we assume name is the provider slug for demo purposes
        const providerSlug = connector.name.toLowerCase();
        const provider = this.getProvider(providerSlug);
        this.logger.debug(`Executing action ${action} on connector ${connectorId}`);
        return await provider.executeAction(action, payload);
    }
    async healthCheck() {
        return { status: 'HEALTHY', registeredProviders: this.providers.size };
    }
};
exports.ConnectorEngine = ConnectorEngine;
exports.ConnectorEngine = ConnectorEngine = ConnectorEngine_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [client_1.PrismaClient])
], ConnectorEngine);
