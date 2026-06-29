import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState } from '../types';

interface AuthStore extends AuthState {
  setUser: (user: AuthState['user']) => void;
  setTokens: (accessToken: string, refreshToken: string, sessionId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      sessionId: null,
      status: 'unauthenticated',
      setUser: (user) => set({ user, status: user ? 'authenticated' : 'unauthenticated' }),
      setTokens: (accessToken, refreshToken, sessionId) => set({ accessToken, refreshToken, sessionId }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null, sessionId: null, status: 'unauthenticated' }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
