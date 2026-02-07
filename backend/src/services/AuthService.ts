import bcrypt from 'bcrypt';
import { AppDataSource } from '@config/database';
import { User } from '@entities/User';
import {
  AuthenticationError,
  NotFoundError,
  ConflictError,
  ValidationError,
} from '@utils/errors';
import { generateToken, verifyToken } from '@middleware/auth';
import { generateId } from '@utils/helpers';
import { UserRole, JWTPayload } from '../types/index';

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Register a new user
   */
  async register(
    email: string,
    password: string,
    name: string,
    role: UserRole = UserRole.SITE_ENGINEER
  ): Promise<{ user: Partial<User>; token: string }> {
    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError(`User with email ${email} already exists`);
    }

    // Validate password strength
    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      id: generateId(),
      email,
      password_hash: passwordHash,
      name,
      role,
      project_ids: [],
      is_active: true,
    });

    await this.userRepository.save(user);

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  /**
   * Login user with email and password
   */
  async login(
    email: string,
    password: string
  ): Promise<{ user: Partial<User>; accessToken: string; refreshToken: string }> {
    // Find user
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    if (!user.is_active) {
      throw new AuthenticationError('User account is inactive');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Update last login
    user.last_login = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const accessToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateToken(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      '30d'
    );

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<string> {
    try {
      const payload = verifyToken(refreshToken) as JWTPayload;

      // Verify user still exists and is active
      const user = await this.userRepository.findOne({
        where: { id: payload.id, is_active: true },
      });

      if (!user) {
        throw new AuthenticationError('User not found or inactive');
      }

      // Generate new access token
      return generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      throw new AuthenticationError('Invalid refresh token');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User', id);
    }

    return this.sanitizeUser(user);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundError('User', email);
    }

    return this.sanitizeUser(user);
  }

  /**
   * Update user profile
   */
  async updateUser(
    id: string,
    updates: Partial<User>
  ): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User', id);
    }

    // Prevent sensitive updates through this method
    const allowedUpdates = ['name', 'phone', 'department'];
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        (user as any)[key] = (updates as any)[key];
      }
    });

    await this.userRepository.save(user);

    return this.sanitizeUser(user);
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);

    if (!isPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Validate new password
    if (newPassword.length < 6) {
      throw new ValidationError('New password must be at least 6 characters');
    }

    // Hash and save new password
    user.password_hash = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(id: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User', id);
    }

    user.is_active = false;
    await this.userRepository.save(user);
  }

  /**
   * Remove sensitive fields from user object
   */
  private sanitizeUser(user: User): Partial<User> {
    const { password_hash, ...sanitized } = user;
    return sanitized;
  }
}

export default new AuthService();
