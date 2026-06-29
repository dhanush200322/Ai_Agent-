export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string | null;
  phone?: string | null;
  emailVerified: boolean;
  isOwner: boolean;
  status: UserStatus;
  organizationId: string;
  roleId: string;
  createdAt: string;
  updatedAt: string;
}
