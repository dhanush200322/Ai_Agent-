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
var IntegrationEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationEngine = void 0;
const common_1 = require("@nestjs/common");
const ConnectorEngine_1 = require("./ConnectorEngine");
const PluginEngine_1 = require("./PluginEngine");
const MarketplaceEngine_1 = require("./MarketplaceEngine");
const CapabilityDiscoveryEngine_1 = require("./CapabilityDiscoveryEngine");
const OAuthEngine_1 = require("./OAuthEngine");
const WebhookEngine_1 = require("./WebhookEngine");
const SchedulerEngine_1 = require("./SchedulerEngine");
const SynchronizationEngine_1 = require("./SynchronizationEngine");
const CredentialEngine_1 = require("./CredentialEngine");
const SandboxEngine_1 = require("./SandboxEngine");
const MonitoringEngine_1 = require("./MonitoringEngine");
const PolicyEngine_1 = require("./PolicyEngine");
let IntegrationEngine = IntegrationEngine_1 = class IntegrationEngine {
    connectorEngine;
    pluginEngine;
    marketplaceEngine;
    capabilityDiscoveryEngine;
    oauthEngine;
    webhookEngine;
    schedulerEngine;
    synchronizationEngine;
    credentialEngine;
    sandboxEngine;
    monitoringEngine;
    policyEngine;
    logger = new common_1.Logger(IntegrationEngine_1.name);
    constructor(connectorEngine, pluginEngine, marketplaceEngine, capabilityDiscoveryEngine, oauthEngine, webhookEngine, schedulerEngine, synchronizationEngine, credentialEngine, sandboxEngine, monitoringEngine, policyEngine) {
        this.connectorEngine = connectorEngine;
        this.pluginEngine = pluginEngine;
        this.marketplaceEngine = marketplaceEngine;
        this.capabilityDiscoveryEngine = capabilityDiscoveryEngine;
        this.oauthEngine = oauthEngine;
        this.webhookEngine = webhookEngine;
        this.schedulerEngine = schedulerEngine;
        this.synchronizationEngine = synchronizationEngine;
        this.credentialEngine = credentialEngine;
        this.sandboxEngine = sandboxEngine;
        this.monitoringEngine = monitoringEngine;
        this.policyEngine = policyEngine;
    }
    async initialize() {
        this.logger.log('Initializing Enterprise Integration Platform...');
        // Initialize engines in order of dependencies
        await this.credentialEngine.initialize();
        await this.policyEngine.initialize();
        await this.sandboxEngine.initialize();
        await this.capabilityDiscoveryEngine.initialize();
        await this.connectorEngine.initialize();
        await this.pluginEngine.initialize();
        await this.marketplaceEngine.initialize();
        await this.oauthEngine.initialize();
        await this.webhookEngine.initialize();
        await this.schedulerEngine.initialize();
        await this.synchronizationEngine.initialize();
        await this.monitoringEngine.initialize();
        this.logger.log('Enterprise Integration Platform Initialized.');
    }
    async healthCheck() {
        return {
            status: 'HEALTHY',
            timestamp: new Date().toISOString(),
            engines: {
                connector: await this.connectorEngine.healthCheck(),
                plugin: await this.pluginEngine.healthCheck(),
                oauth: await this.oauthEngine.healthCheck(),
                webhook: await this.webhookEngine.healthCheck(),
                scheduler: await this.schedulerEngine.healthCheck(),
            }
        };
    }
};
exports.IntegrationEngine = IntegrationEngine;
exports.IntegrationEngine = IntegrationEngine = IntegrationEngine_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ConnectorEngine_1.ConnectorEngine,
        PluginEngine_1.PluginEngine,
        MarketplaceEngine_1.MarketplaceEngine,
        CapabilityDiscoveryEngine_1.CapabilityDiscoveryEngine,
        OAuthEngine_1.OAuthEngine,
        WebhookEngine_1.WebhookEngine,
        SchedulerEngine_1.SchedulerEngine,
        SynchronizationEngine_1.SynchronizationEngine,
        CredentialEngine_1.CredentialEngine,
        SandboxEngine_1.SandboxEngine,
        MonitoringEngine_1.MonitoringEngine,
        PolicyEngine_1.PolicyEngine])
], IntegrationEngine);
