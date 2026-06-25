declare global {
  namespace Express {
    interface Request {
      reqId?: string;
      sessionId?: string;

      user?: {
        id: string;
        organizationId: string;
        email?: string;
        role?: any; // To allow assigning the whole user object from prisma, or we can make it more explicit.
        permissions?: string[];
        [key: string]: any; // Since the auth middleware spreads `...user`, we can allow extra props.
      };
    }
  }
}

export {};
