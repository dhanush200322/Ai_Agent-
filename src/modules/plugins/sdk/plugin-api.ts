import { PluginManifest } from './plugin-manifest';

/**
 * The standard SDK exposed to external plugin developers.
 */
export class PluginSDK {
  private manifest: PluginManifest;
  private tools: Map<string, Function> = new Map();
  private nodes: Map<string, Function> = new Map();
  private capabilities: Map<string, Function> = new Map();
  private connectors: Map<string, Function> = new Map();

  constructor(manifest: PluginManifest) {
    this.manifest = manifest;
  }

  registerTool(name: string, handler: (input: any, context: any) => Promise<any>) {
    this.tools.set(name, handler);
  }

  registerWorkflowNode(type: string, handler: (input: any, context: any) => Promise<any>) {
    this.nodes.set(type, handler);
  }

  registerAgentCapability(name: string, handler: (input: any, context: any) => Promise<any>) {
    this.capabilities.set(name, handler);
  }

  registerConnector(name: string, handler: (config: any) => any) {
    this.connectors.set(name, handler);
  }

  // Internal framework methods for bridging the Plugin into the Sandbox
  _getToolHandler(name: string) { return this.tools.get(name); }
  _getNodeHandler(type: string) { return this.nodes.get(type); }
  _getManifest() { return this.manifest; }
}
