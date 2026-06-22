import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository } from '../repositories/auth.repository';
import { ConflictError, AuthenticationError } from '../../../shared/errors/AppError';
import logger from '../../../shared/logger/logger';

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  // Hardcoded default permissions as required by spec
  private get defaultPermissions() {
    return [
      { name: 'agent:create', resource: 'agent', action: 'create', category: 'Agent' },
      { name: 'agent:update', resource: 'agent', action: 'update', category: 'Agent' },
      { name: 'agent:delete', resource: 'agent', action: 'delete', category: 'Agent' },
      { name: 'agent:view', resource: 'agent', action: 'view', category: 'Agent' },
      { name: 'knowledge:create', resource: 'knowledge', action: 'create', category: 'Knowledge' },
      { name: 'knowledge:update', resource: 'knowledge', action: 'update', category: 'Knowledge' },
      { name: 'knowledge:delete', resource: 'knowledge', action: 'delete', category: 'Knowledge' },
      { name: 'knowledge:view', resource: 'knowledge', action: 'view', category: 'Knowledge' },
      { name: 'organization:view', resource: 'organization', action: 'view', category: 'Organization' },
      { name: 'organization:update', resource: 'organization', action: 'update', category: 'Organization' },
      { name: 'user:create', resource: 'user', action: 'create', category: 'User' },
      { name: 'user:update', resource: 'user', action: 'update', category: 'User' },
      { name: 'user:delete', resource: 'user', action: 'delete', category: 'User' },
      { name: 'role:update', resource: 'role', action: 'update', category: 'Role' },
      { name: 'billing:view', resource: 'billing', action: 'view', category: 'Billing' },
      { name: 'billing:update', resource: 'billing', action: 'update', category: 'Billing' },
      { name: 'settings:update', resource: 'settings', action: 'update', category: 'Settings' }
    ];
  }

  async hashPassword(password: string): Promise<string> {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
    return bcrypt.hash(password, rounds);
  }

  generateAccessToken(user: any) {
    return jwt.sign(
      { 
        userId: user.id, 
        organizationId: user.organizationId, 
        roleId: user.roleId, 
        email: user.email 
      },
      process.env.JWT_ACCESS_SECRET as string,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES as any }
    );
  }

  generateRefreshToken(user: any) {
    return jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES as any }
    );
  }

  async register(data: any) {
    logger.info(`Registration attempt for email: ${data.email}`);

    const existingUser = await this.authRepository.findUserByEmail(data.email);
    if (existingUser) {
      logger.warn(`Registration failed. Email exists: ${data.email}`);
      throw new ConflictError('Email is already registered');
    }

    const existingOrg = await this.authRepository.findOrganizationBySlug(data.organizationSlug);
    if (existingOrg) {
      logger.warn(`Registration failed. Org slug exists: ${data.organizationSlug}`);
      throw new ConflictError('Organization slug is already taken');
    }

    const passwordHash = await this.hashPassword(data.password);

    const user = await this.authRepository.registerTransaction({
      orgName: data.organizationName,
      orgSlug: data.organizationSlug,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash,
      defaultPermissions: this.defaultPermissions
    });

    logger.info(`Registration successful for user: ${user.id}`);

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, tokens: { accessToken, refreshToken } };
  }

  async login(data: any, ip?: string) {
    logger.info(`Login attempt for email: ${data.email}`);

    const user = await this.authRepository.findUserByEmail(data.email);
    if (!user) {
      logger.warn(`Login failed. User not found: ${data.email}`);
      throw new AuthenticationError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      logger.warn(`Login failed. Incorrect password for: ${data.email}`);
      throw new AuthenticationError('Invalid email or password');
    }

    if (user.status !== 'ACTIVE' || user.deletedAt) {
      logger.warn(`Login failed. User inactive: ${user.id}`);
      throw new AuthenticationError('Your account is not active');
    }

    await this.authRepository.updateLastLogin(user.id, ip);

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    logger.info(`Login successful for user: ${user.id}`);

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, tokens: { accessToken, refreshToken } };
  }

  async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as any;
      const user = await this.authRepository.findUserById(decoded.userId);
      
      if (!user || user.status !== 'ACTIVE' || user.deletedAt) {
        throw new AuthenticationError('User account is invalid');
      }

      const newAccessToken = this.generateAccessToken(user);
      logger.info(`Token refresh successful for user: ${user.id}`);

      return { accessToken: newAccessToken };
    } catch (err) {
      logger.warn(`Token refresh failed`);
      throw new AuthenticationError('Invalid refresh token');
    }
  }

  async me(userId: string) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }
}
