import crypto from 'crypto';

export class TokenHelper {
  static generateRandomToken(bytes: number = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  }
}
