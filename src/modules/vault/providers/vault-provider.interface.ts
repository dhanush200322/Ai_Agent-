export interface StoreSecretParams {
  name: string;
  description?: string;
  category: string;
  value: string;
}

export interface SecretVersion {
  version: number;
  encryptedValue: string;
  iv: string;
  authTag: string;
  keyVersion: number;
  createdAt: Date;
}

export interface RetrieveSecretResult {
  value: string;
  version: number;
  category: string;
  provider: string;
}

export interface VaultProvider {
  /**
   * Store a new secret (creates V1)
   */
  store(organizationId: string, params: StoreSecretParams): Promise<string>;

  /**
   * Retrieve the decrypted value of a secret (latest or specific version)
   */
  retrieve(organizationId: string, secretId: string, version?: number): Promise<RetrieveSecretResult | null>;

  /**
   * Update a secret (creates V+1)
   */
  rotate(organizationId: string, secretId: string, newValue: string): Promise<number>;

  /**
   * Soft delete a secret
   */
  disable(organizationId: string, secretId: string): Promise<void>;

  /**
   * List all active secrets metadata (no values)
   */
  list(organizationId: string, category?: string): Promise<any[]>;
}
