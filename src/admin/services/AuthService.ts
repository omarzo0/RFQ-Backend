import { prisma } from "../../app";
import { JWTUtils } from "../middleware/auth";
import { PasswordUtils } from "../../utils/password";
import {
  AppError,
  ValidationError,
  AuthenticationError,
} from "../../utils/errors";
import logger from "../../utils/logger";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCompanyData {
  companyName: string;
  companyEmail: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  domain?: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    userType: "ADMIN" | "COMPANY_USER";
    companyId?: string;
    companyName?: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export class AuthService {
  /**
   * Login admin user
   */
  async loginAdmin(credentials: LoginCredentials): Promise<LoginResponse> {
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
      user: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        userType: "ADMIN",
      },
      tokens,
    };
  }

  /**
   * Login company user
   */
  async loginCompanyUser(
    credentials: LoginCredentials
  ): Promise<LoginResponse> {
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
      throw new AuthenticationError(
        "Account is locked until the subscription plan is paid"
      );
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
        role: user.role,
        userType: "COMPANY_USER",
        companyId: user.companyId,
        companyName: user.company.name,
      },
      tokens,
    };
  }

  /**
   * Register new company with admin user
   */
  async registerCompany(data: RegisterCompanyData): Promise<LoginResponse> {
    const {
      companyName,
      companyEmail,
      firstName,
      lastName,
      email,
      password,
      phone,
      domain,
    } = data;

    // Validate password strength
    const passwordValidation = PasswordUtils.validate(password);
    if (!passwordValidation.isValid) {
      throw new ValidationError("Invalid password", passwordValidation.errors);
    }

    // Check if company email already exists
    const existingCompany = await prisma.company.findUnique({
      where: { email: companyEmail.toLowerCase() },
    });

    if (existingCompany) {
      throw new ValidationError("Company email already registered");
    }

    // Check if user email already exists
    const existingUser = await prisma.companyUser.findFirst({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ValidationError("User email already registered");
    }

    // Hash password
    const passwordHash = await PasswordUtils.hash(password);

    // Create company and admin user in transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create company
      const company = await prisma.company.create({
        data: {
          name: companyName,
          email: companyEmail.toLowerCase(),
          phone,
          domain,
          subscriptionPlan: "trial",
          subscriptionStatus: "ACTIVE",
          trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      // Create admin user
      const user = await prisma.companyUser.create({
        data: {
          companyId: company.id,
          email: email.toLowerCase(),
          passwordHash,
          firstName,
          lastName,
          role: "ADMIN",
        },
      });

      return { company, user };
    });

    // Generate tokens
    const tokens = await JWTUtils.generateTokenPair(
      result.user.id,
      "COMPANY_USER",
      result.user.role,
      result.company.id
    );

    logger.info(
      `New company registered: ${companyName} with admin user: ${email}`
    );

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
        userType: "COMPANY_USER",
        companyId: result.company.id,
        companyName: result.company.name,
      },
      tokens,
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
   * Logout user (revoke refresh tokens)
   */
  async logout(
    userId: string,
    userType: "ADMIN" | "COMPANY_USER"
  ): Promise<void> {
    await JWTUtils.revokeAllTokens(userId, userType);
    logger.info(`User logged out: ${userId} (${userType})`);
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(userId: string, userType: "ADMIN" | "COMPANY_USER") {
    if (userType === "ADMIN") {
      const admin = await prisma.admin.findUnique({
        where: { id: userId, isActive: true },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          lastLoginAt: true,
          createdAt: true,
        },
      });

      if (!admin) {
        throw new AppError("Admin not found", 404);
      }

      return {
        ...admin,
        userType: "ADMIN" as const,
      };
    } else {
      const user = await prisma.companyUser.findUnique({
        where: { id: userId, isActive: true },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          lastLoginAt: true,
          createdAt: true,
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
        userType: "COMPANY_USER" as const,
      };
    }
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    userType: "ADMIN" | "COMPANY_USER",
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Validate new password
    const passwordValidation = PasswordUtils.validate(newPassword);
    if (!passwordValidation.isValid) {
      throw new ValidationError("Invalid password", passwordValidation.errors);
    }

    // Get current user
    let currentPasswordHash: string;

    if (userType === "ADMIN") {
      const admin = await prisma.admin.findUnique({
        where: { id: userId },
        select: { passwordHash: true },
      });

      if (!admin) {
        throw new AppError("Admin not found", 404);
      }

      currentPasswordHash = admin.passwordHash;
    } else {
      const user = await prisma.companyUser.findUnique({
        where: { id: userId },
        select: { passwordHash: true },
      });

      if (!user) {
        throw new AppError("User not found", 404);
      }

      currentPasswordHash = user.passwordHash;
    }

    // Verify current password
    const isValidCurrentPassword = await PasswordUtils.compare(
      currentPassword,
      currentPasswordHash
    );
    if (!isValidCurrentPassword) {
      throw new AuthenticationError("Current password is incorrect");
    }

    // Hash new password
    const newPasswordHash = await PasswordUtils.hash(newPassword);

    // Update password
    if (userType === "ADMIN") {
      await prisma.admin.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      });
    } else {
      await prisma.companyUser.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      });
    }

    // Revoke all existing tokens to force re-login
    await JWTUtils.revokeAllTokens(userId, userType);

    logger.info(`Password changed for user: ${userId} (${userType})`);
  }
}
