import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/user';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  sessionId: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string, sessionId: string) => void;
  updateUser: (user: Partial<User>) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      sessionId: null,
      setAuth: (user, accessToken, refreshToken, sessionId) =>
        set({ user, accessToken, refreshToken, sessionId }),
      updateUser: (updates) =>
        set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
      clearAuth: () => set({ user: null, accessToken: null, refreshToken: null, sessionId: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
