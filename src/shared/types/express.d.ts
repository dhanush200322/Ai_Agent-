import { User, Organization, Role } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      reqId?: string;
      requestId?: string;
      organizationId?: string;
      userId?: string;
      roleId?: string;
      permissions?: string[];
      user?: User & { organization: Organization; role: Role; permissions?: string[] };
    }
  }
}
