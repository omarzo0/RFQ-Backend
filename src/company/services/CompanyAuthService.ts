import { prisma } from "../../app";
import { JWTUtils } from "../../admin/middleware/auth";
import { PasswordUtils } from "../../utils/password";
import {
  AppError,
  ValidationError,
  AuthenticationError,
} from "../../utils/errors";
import logger from "../../utils/logger";
import {
  CompanyLoginCredentials,
  CompanyLoginResponse,
  CompanyProfile,
  UserRole,
} from "../types/auth";

export class CompanyAuthService {
  /**
   * Login company user
   */
  async loginCompanyUser(
    credentials: CompanyLoginCredentials
  ): Promise<CompanyLoginResponse> {
    const { email, password } = credentials;

    // Find user by email with company data
    const user = await prisma.companyUser.findFirst({
      where: {
        email: email.toLowerCase(),
        isActive: true,
        company: { isActive: true },
      },
      include: { company: true },
    });

    if (!user) {
      logger.warn(`Failed company user login attempt for email: ${email}`);
      throw new AuthenticationError("Invalid email or password");
    }

    // Check if company subscription is active
    if (user.company.subscriptionStatus !== "ACTIVE") {
      throw new AuthenticationError("Company subscription is not active");
    }

    // Verify password
    const isValidPassword = await PasswordUtils.compare(
      password,
      user.passwordHash
    );
    if (!isValidPassword) {
      logger.warn(`Invalid password for company user: ${email}`);
      throw new AuthenticationError("Invalid email or password");
    }

    // Generate tokens
    const tokens = await JWTUtils.generateTokenPair(
      user.id,
      "COMPANY_USER",
      user.role,
      user.companyId
    );

    // Update last login
    await prisma.companyUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    logger.info(
      `Company user login successful: ${email} (Company: ${user.company.name})`
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as UserRole,
        userType: "COMPANY_USER",
        companyId: user.companyId,
        companyName: user.company.name,
      },
      tokens,
    };
  }

  /**
   * Get current company user profile
   */
  async getCurrentUser(userId: string): Promise<CompanyProfile> {
    const user = await prisma.companyUser.findUnique({
      where: { id: userId, isActive: true },
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
        companyId: true,
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            subscriptionPlan: true,
            subscriptionStatus: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return {
      ...user,
      role: user.role as UserRole,
      lastLoginAt: user.lastLoginAt || undefined,
    };
  }

  /**
   * Change company user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Validate new password
    const passwordValidation = PasswordUtils.validate(newPassword);
    if (!passwordValidation.isValid) {
      throw new ValidationError("Invalid password", passwordValidation.errors);
    }

    // Get current user
    const user = await prisma.companyUser.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Verify current password
    const isValidCurrentPassword = await PasswordUtils.compare(
      currentPassword,
      user.passwordHash
    );
    if (!isValidCurrentPassword) {
      throw new AuthenticationError("Current password is incorrect");
    }

    // Hash new password
    const newPasswordHash = await PasswordUtils.hash(newPassword);

    // Update password
    await prisma.companyUser.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // Revoke all existing tokens to force re-login
    await JWTUtils.revokeAllTokens(userId, "COMPANY_USER");

    logger.info(`Password changed for user: ${userId}`);
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
   * Logout company user (revoke refresh tokens)
   */
  async logout(userId: string): Promise<void> {
    await JWTUtils.revokeAllTokens(userId, "COMPANY_USER");
    logger.info(`Company user logged out: ${userId}`);
  }
}
