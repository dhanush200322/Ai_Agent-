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
exports.IntegrationsModule = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const engine_1 = require("./engine");
const providers_1 = require("./providers");
let IntegrationsModule = class IntegrationsModule {
    integrationEngine;
    connectorEngine;
    githubProvider;
    slackProvider;
    googleDriveProvider;
    stripeProvider;
    constructor(integrationEngine, connectorEngine, githubProvider, slackProvider, googleDriveProvider, stripeProvider) {
        this.integrationEngine = integrationEngine;
        this.connectorEngine = connectorEngine;
        this.githubProvider = githubProvider;
        this.slackProvider = slackProvider;
        this.googleDriveProvider = googleDriveProvider;
        this.stripeProvider = stripeProvider;
    }
    async onModuleInit() {
        // Register providers
        this.connectorEngine.registerProvider('github', this.githubProvider);
        this.connectorEngine.registerProvider('slack', this.slackProvider);
        this.connectorEngine.registerProvider('google_drive', this.googleDriveProvider);
        this.connectorEngine.registerProvider('stripe', this.stripeProvider);
        // Initialize the engine platform
        await this.integrationEngine.initialize();
    }
};
exports.IntegrationsModule = IntegrationsModule;
exports.IntegrationsModule = IntegrationsModule = __decorate([
    (0, common_1.Module)({
        providers: [
            client_1.PrismaClient, // in reality, should be imported from a DatabaseModule
            // Engines
            engine_1.CapabilityDiscoveryEngine,
            engine_1.SandboxEngine,
            engine_1.CredentialEngine,
            engine_1.PolicyEngine,
            engine_1.ConnectorEngine,
            engine_1.PluginEngine,
            engine_1.MarketplaceEngine,
            engine_1.OAuthEngine,
            engine_1.WebhookEngine,
            engine_1.SchedulerEngine,
            engine_1.SynchronizationEngine,
            engine_1.MonitoringEngine,
            engine_1.IntegrationEngine,
            // Providers
            providers_1.GitHubProvider,
            providers_1.SlackProvider,
            providers_1.GoogleDriveProvider,
            providers_1.StripeProvider,
        ],
        exports: [
            engine_1.IntegrationEngine,
            engine_1.ConnectorEngine,
            engine_1.PluginEngine,
            engine_1.OAuthEngine,
            engine_1.WebhookEngine
        ]
    }),
    __metadata("design:paramtypes", [engine_1.IntegrationEngine,
        engine_1.ConnectorEngine,
        providers_1.GitHubProvider,
        providers_1.SlackProvider,
        providers_1.GoogleDriveProvider,
        providers_1.StripeProvider])
], IntegrationsModule);
