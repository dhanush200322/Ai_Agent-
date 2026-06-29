import { User } from './user';

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponseData extends AuthTokens {
  user: User;
}

export interface MfaChallengeData {
  requireMfa: true;
  userId: string;
}

export interface RefreshRequest {
  refreshToken: string;
  sessionId: string;
}

export interface RefreshResponseData {
  accessToken: string;
  refreshToken: string;
}

export interface OAuthInitResponse {
  url: string;
}
