import { api } from '@/services/api/api';
import { LoginFormValues, ForgotPasswordFormValues } from '../schemas';

export const authService = {
  login: async (data: LoginFormValues) => {
    const response = await api.post('/auth/login', data);
    // Based on actual backend contract: { success: true, data: { accessToken, refreshToken, user, requireMfa, sessionId } }
    // Note: sessionId might not be returned in login if it's stored in a cookie, but according to our store we need it.
    // Let's assume the backend engine creates a session and we can extract it if it's there. 
    // Actually, looking at `AuthenticationEngine.login`, it returns `{ accessToken, refreshToken, user }`. 
    // Wait, it doesn't return sessionId! The JWT contains it, or the client doesn't need to send it explicitly if it's in the JWT?
    // In `refresh` it expects `sessionId: string`. Since `login` doesn't return it, we will extract it from the decoded JWT payload or maybe the backend needs fixing.
    // Wait, the instructions say "DO NOT Modify backend source code".
    // Let's decode the JWT to get the sessionId!
    
    const { accessToken, refreshToken, user, requireMfa, userId } = response.data.data;
    
    if (requireMfa) {
      return { requireMfa, userId };
    }
    
    // Parse JWT to get sessionId
    const payloadBase64 = accessToken.split('.')[1];
    const decodedJson = atob(payloadBase64);
    const decoded = JSON.parse(decodedJson);
    const sessionId = decoded.sessionId;

    return { accessToken, refreshToken, user, sessionId };
  },
  
  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    const { user, tokens } = response.data.data;
    const { accessToken, refreshToken } = tokens;
    
    // Parse JWT to get sessionId
    const payloadBase64 = accessToken.split('.')[1];
    const decodedJson = atob(payloadBase64);
    const decoded = JSON.parse(decodedJson);
    const sessionId = decoded.sessionId;

    return { tokens: { accessToken, refreshToken, sessionId }, user };
  },
  
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Gracefully ignore server errors on logout so local state clears without warnings
    }
  },
  
  forgotPassword: async (data: ForgotPasswordFormValues) => {
    const response = await api.post('/auth/password/reset', data);
    return response.data.data;
  },
  
  resetPassword: async (data: any) => {
    throw new Error("Password reset is only supported internally for authenticated users.");
  },
  
  refreshSession: async (refreshToken: string, sessionId: string) => {
    const axios = require('axios');
    const response = await axios.post((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1') + '/auth/refresh', {
      refreshToken,
      sessionId
    });
    return response.data.data;
  },
  
  getCurrentUser: async () => {
    return null;
  },
};
