"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CapabilityDiscoveryEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapabilityDiscoveryEngine = void 0;
const common_1 = require("@nestjs/common");
let CapabilityDiscoveryEngine = CapabilityDiscoveryEngine_1 = class CapabilityDiscoveryEngine {
    logger = new common_1.Logger(CapabilityDiscoveryEngine_1.name);
    capabilities = new Map();
    manifests = new Map();
    async initialize() {
        this.logger.log('Initializing CapabilityDiscoveryEngine...');
    }
    registerProviderCapabilities(providerSlug, manifest, caps) {
        this.manifests.set(providerSlug, manifest);
        this.capabilities.set(providerSlug, caps);
        this.logger.debug(`Registered capabilities for provider: ${providerSlug}`);
    }
    getCapabilities(providerSlug) {
        return this.capabilities.get(providerSlug) || [];
    }
    getAllCapabilities() {
        const result = {};
        for (const [providerSlug, caps] of this.capabilities.entries()) {
            result[providerSlug] = caps;
        }
        return result;
    }
    getProviderManifest(providerSlug) {
        return this.manifests.get(providerSlug);
    }
    hasCapability(providerSlug, action) {
        const caps = this.capabilities.get(providerSlug);
        if (!caps)
            return false;
        return caps.some(c => c.action === action);
    }
};
exports.CapabilityDiscoveryEngine = CapabilityDiscoveryEngine;
exports.CapabilityDiscoveryEngine = CapabilityDiscoveryEngine = CapabilityDiscoveryEngine_1 = __decorate([
    (0, common_1.Injectable)()
], CapabilityDiscoveryEngine);
