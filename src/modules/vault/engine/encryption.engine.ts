import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

export interface EncryptedData {
  encryptedValue: string; // Base64
  iv: string; // Base64
  authTag: string; // Base64
  keyVersion: number;
}

export class EncryptionEngine {
  private masterKeys: Map<number, Buffer> = new Map();
  private currentKeyVersion: number;

  constructor() {
    // In a real system, you'd load multiple keys. For now, we load V1 from env.
    const keyStr = process.env.VAULT_MASTER_KEY || '0123456789abcdef0123456789abcdef';
    
    if (keyStr.length !== 32) {
      throw new Error('VAULT_MASTER_KEY must be exactly 32 characters for AES-256');
    }

    this.currentKeyVersion = 1;
    this.masterKeys.set(1, Buffer.from(keyStr, 'utf-8'));
  }

  encrypt(plainText: string): EncryptedData {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = this.masterKeys.get(this.currentKeyVersion)!;
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const authTag = cipher.getAuthTag();

    return {
      encryptedValue: encrypted,
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      keyVersion: this.currentKeyVersion,
    };
  }

  decrypt(encryptedData: EncryptedData): string {
    const key = this.masterKeys.get(encryptedData.keyVersion);
    if (!key) {
      throw new Error(`Master key version ${encryptedData.keyVersion} not found.`);
    }

    const iv = Buffer.from(encryptedData.iv, 'base64');
    const authTag = Buffer.from(encryptedData.authTag, 'base64');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData.encryptedValue, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
