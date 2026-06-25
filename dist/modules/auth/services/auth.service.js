"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_repository_1 = require("../repositories/auth.repository");
const AppError_1 = require("../../../shared/errors/AppError");
const logger_1 = __importDefault(require("../../../shared/logger/logger"));
class AuthService {
    authRepository;
    constructor() {
        this.authRepository = new auth_repository_1.AuthRepository();
    }
    // Hardcoded default permissions as required by spec
    get defaultPermissions() {
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
    async hashPassword(password) {
        const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
        return bcrypt_1.default.hash(password, rounds);
    }
    generateAccessToken(user) {
        return jsonwebtoken_1.default.sign({
            userId: user.id,
            organizationId: user.organizationId,
            roleId: user.roleId,
            email: user.email
        }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES });
    }
    generateRefreshToken(user) {
        return jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES });
    }
    async register(data) {
        logger_1.default.info(`Registration attempt for email: ${data.email}`);
        const existingUser = await this.authRepository.findUserByEmail(data.email);
        if (existingUser) {
            logger_1.default.warn(`Registration failed. Email exists: ${data.email}`);
            throw new AppError_1.ConflictError('Email is already registered');
        }
        const existingOrg = await this.authRepository.findOrganizationBySlug(data.organizationSlug);
        if (existingOrg) {
            logger_1.default.warn(`Registration failed. Org slug exists: ${data.organizationSlug}`);
            throw new AppError_1.ConflictError('Organization slug is already taken');
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
        logger_1.default.info(`Registration successful for user: ${user.id}`);
        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);
        const { passwordHash: _, ...safeUser } = user;
        return { user: safeUser, tokens: { accessToken, refreshToken } };
    }
    async login(data, ip) {
        logger_1.default.info(`Login attempt for email: ${data.email}`);
        const user = await this.authRepository.findUserByEmail(data.email);
        if (!user) {
            logger_1.default.warn(`Login failed. User not found: ${data.email}`);
            throw new AppError_1.AuthenticationError('Invalid email or password');
        }
        const isMatch = await bcrypt_1.default.compare(data.password, user.passwordHash);
        if (!isMatch) {
            logger_1.default.warn(`Login failed. Incorrect password for: ${data.email}`);
            throw new AppError_1.AuthenticationError('Invalid email or password');
        }
        if (user.status !== 'ACTIVE' || user.deletedAt) {
            logger_1.default.warn(`Login failed. User inactive: ${user.id}`);
            throw new AppError_1.AuthenticationError('Your account is not active');
        }
        await this.authRepository.updateLastLogin(user.id, ip);
        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);
        logger_1.default.info(`Login successful for user: ${user.id}`);
        const { passwordHash: _, ...safeUser } = user;
        return { user: safeUser, tokens: { accessToken, refreshToken } };
    }
    async refreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET);
            const user = await this.authRepository.findUserById(decoded.userId);
            if (!user || user.status !== 'ACTIVE' || user.deletedAt) {
                throw new AppError_1.AuthenticationError('User account is invalid');
            }
            const newAccessToken = this.generateAccessToken(user);
            logger_1.default.info(`Token refresh successful for user: ${user.id}`);
            return { accessToken: newAccessToken };
        }
        catch (err) {
            logger_1.default.warn(`Token refresh failed`);
            throw new AppError_1.AuthenticationError('Invalid refresh token');
        }
    }
    async me(userId) {
        const user = await this.authRepository.findUserById(userId);
        if (!user) {
            throw new AppError_1.AuthenticationError('User not found');
        }
        const { passwordHash: _, ...safeUser } = user;
        return safeUser;
    }
}
exports.AuthService = AuthService;
