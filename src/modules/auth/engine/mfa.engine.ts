import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import * as crypto from 'crypto';

export class MFAEngine {
  async generateSecret(email: string): Promise<{ secret: string; qrCodeUrl: string }> {
    const secret = speakeasy.generateSecret({ name: `EnterpriseAI (${email})` });
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);
    return {
      secret: secret.base32,
      qrCodeUrl,
    };
  }

  async verifyToken(secret: string, token: string): Promise<boolean> {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1, // Allow 1 step before/after
    });
  }

  async generateRecoveryCodes(count: number = 10): Promise<string[]> {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(crypto.randomBytes(4).toString('hex'));
    }
    return codes;
  }
}
