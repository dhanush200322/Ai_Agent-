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
var MarketplaceEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceEngine = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let MarketplaceEngine = MarketplaceEngine_1 = class MarketplaceEngine {
    prisma;
    logger = new common_1.Logger(MarketplaceEngine_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async initialize() {
        this.logger.log('Initializing MarketplaceEngine...');
    }
    async searchPlugins(query, category) {
        // Basic search implementation for marketplace
        return this.prisma.pluginMarketplaceEntry.findMany({
            where: {
                plugin: {
                    status: 'PUBLISHED',
                    visibility: 'PUBLIC',
                    name: { contains: query, mode: 'insensitive' }
                },
                ...(category && { categoryId: category })
            },
            include: { plugin: { include: { versions: { take: 1, orderBy: { publishedAt: 'desc' } } } } }
        });
    }
    async getPluginDetails(pluginId) {
        return this.prisma.plugin.findUnique({
            where: { id: pluginId },
            include: { versions: true }
        });
    }
};
exports.MarketplaceEngine = MarketplaceEngine;
exports.MarketplaceEngine = MarketplaceEngine = MarketplaceEngine_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [client_1.PrismaClient])
], MarketplaceEngine);
