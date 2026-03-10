import { prisma } from "../../app";
import { JWTUtils } from "../middleware/auth";
import { PasswordUtils } from "../../utils/password";
import {
  AppError,
  ValidationError,
  AuthenticationError,
} from "../../utils/errors";
import logger from "../../utils/logger";
import {
  AdminLoginCredentials,
  AdminLoginResponse,
  AdminProfile,
  AdminRole,
} from "../types/auth";

export class AdminAuthService {
  /**
   * Login admin user
   */
  async loginAdmin(
    credentials: AdminLoginCredentials
  ): Promise<AdminLoginResponse> {
    const { email, password } = credentials;

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!admin) {
      logger.warn(`Failed admin login attempt for email: ${email}`);
      throw new AuthenticationError("Invalid email or password");
    }

    if (!admin.isActive) {
      logger.warn(`Login attempt for inactive admin: ${email}`);
      throw new AuthenticationError("Account is inactive");
    }

    // Verify password
    const isValidPassword = await PasswordUtils.compare(
      password,
      admin.passwordHash
    );
    if (!isValidPassword) {
      logger.warn(`Invalid password for admin: ${email}`);
      throw new AuthenticationError("Invalid email or password");
    }

    // Generate tokens
    const tokens = await JWTUtils.generateTokenPair(
      admin.id,
      "ADMIN",
      admin.role
    );

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    logger.info(`Admin login successful: ${email}`);

    return {
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role as AdminRole,
        isActive: admin.isActive,
        lastLoginAt: admin.lastLoginAt || undefined,
      },
      tokens,
    };
  }

  /**
   * Get current admin profile
   */
  async getCurrentAdmin(adminId: string): Promise<AdminProfile> {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId, isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      throw new AppError("Admin not found", 404);
    }

    return {
      ...admin,
      role: admin.role as AdminRole,
      lastLoginAt: admin.lastLoginAt || undefined,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return JWTUtils.refreshAccessToken(refreshToken);
  }

  /**
   * Logout admin (revoke refresh tokens)
   */
  async logout(adminId: string): Promise<void> {
    await JWTUtils.revokeAllTokens(adminId, "ADMIN");
    logger.info(`Admin logged out: ${adminId}`);
  }
}
