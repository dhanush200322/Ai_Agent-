export interface IdentityProvider {
  authenticate(credentials: any): Promise<any>;
  refresh(token: string): Promise<any>;
  revoke(token: string): Promise<void>;
  verify(token: string): Promise<any>;
  logout(token: string): Promise<void>;
}
