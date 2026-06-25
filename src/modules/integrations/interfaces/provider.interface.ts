export interface ConnectorManifest {
  name: string;
  version: string;
  provider: string;
  authentication: 'OAUTH2' | 'API_KEY' | 'BASIC' | 'NONE';
  permissions: string[];
  actions: string[];
  events: string[];
  healthCheck: boolean;
  webhooks: boolean;
  limits: {
    rateLimit?: number;
    concurrency?: number;
  };
  requiredScopes: string[];
}

export interface ProviderCapability {
  action: string;
  description: string;
  schema?: any;
}

export interface IntegrationProvider {
  getManifest(): ConnectorManifest;
  
  // Initialization & Validation
  initialize(config: any): Promise<void>;
  validateConfiguration(config: any): Promise<boolean>;
  
  // Health & Metrics
  healthCheck(): Promise<{ status: 'HEALTHY' | 'DEGRADED' | 'DOWN'; latencyMs: number; error?: string }>;
  getMetrics?(): Promise<any>;

  // Execution
  executeAction(action: string, payload: any): Promise<any>;
  
  // Webhooks
  verifyWebhookSignature?(payload: string, signature: string, secret: string): Promise<boolean>;
  processWebhook?(event: any): Promise<void>;

  // Capabilities
  getCapabilities(): ProviderCapability[];
}
