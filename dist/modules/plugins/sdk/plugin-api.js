"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginSDK = void 0;
/**
 * The standard SDK exposed to external plugin developers.
 */
class PluginSDK {
    manifest;
    tools = new Map();
    nodes = new Map();
    capabilities = new Map();
    connectors = new Map();
    constructor(manifest) {
        this.manifest = manifest;
    }
    registerTool(name, handler) {
        this.tools.set(name, handler);
    }
    registerWorkflowNode(type, handler) {
        this.nodes.set(type, handler);
    }
    registerAgentCapability(name, handler) {
        this.capabilities.set(name, handler);
    }
    registerConnector(name, handler) {
        this.connectors.set(name, handler);
    }
    // Internal framework methods for bridging the Plugin into the Sandbox
    _getToolHandler(name) { return this.tools.get(name); }
    _getNodeHandler(type) { return this.nodes.get(type); }
    _getManifest() { return this.manifest; }
}
exports.PluginSDK = PluginSDK;
