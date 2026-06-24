export interface PluginManifest {
  id: string;
  name: string;
  version: string; // semver
  author: string;
  description: string;
  minimumPlatformVersion: string;
  maximumPlatformVersion?: string;
  
  permissions: string[];
  tools: PluginToolDefinition[];
  workflowNodes: PluginNodeDefinition[];
  agentCapabilities: PluginCapabilityDefinition[];
  connectors: PluginConnectorDefinition[];
  dependencies: Record<string, string>; // e.g. "oauth-plugin": "^1.0.0"
  
  entry: string; // e.g. "dist/index.js"
  signature?: string;
  checksum?: string;
  license: string;
}

export interface PluginToolDefinition {
  name: string;
  description: string;
  schema: any; // JSON schema
}

export interface PluginNodeDefinition {
  type: string;
  displayName: string;
  category: string;
}

export interface PluginCapabilityDefinition {
  name: string;
  priority?: number;
}

export interface PluginConnectorDefinition {
  type: 'REST' | 'WEBHOOK' | 'MCP' | 'DATABASE';
  name: string;
}
