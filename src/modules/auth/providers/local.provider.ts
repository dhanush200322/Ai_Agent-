import { IdentityProvider } from './identity-provider.interface';

export class LocalProvider implements IdentityProvider {
  async authenticate(credentials: any): Promise<any> {
    // Basic local auth logic using bcrypt (to be implemented)
    throw new Error('Method not implemented.');
  }

  async refresh(token: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  async revoke(token: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async verify(token: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  async logout(token: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
