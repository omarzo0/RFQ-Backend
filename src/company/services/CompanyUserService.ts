import { prisma } from "../../app";
import { PasswordUtils } from "../../utils/password";
import { AppError, ValidationError } from "../../utils/errors";
import logger from "../../utils/logger";
import { UserRole } from "@prisma/client";

export interface CompanyUserCreateData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive?: boolean;
  companyId: string;
}

export interface CompanyUserUpdateData {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface CompanyUserFilters {
  page: number;
  limit: number;
  search?: string;
  role?: string;
  isActive?: boolean;
  companyId: string;
}

export interface CompanyUserListResponse {
  users: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class CompanyUserService {
  /**
   * Create a new company user
   */
  async createUser(data: CompanyUserCreateData): Promise<any> {
    // Validate password
    const passwordValidation = PasswordUtils.validate(data.password);
    if (!passwordValidation.isValid) {
      throw new ValidationError("Invalid password", passwordValidation.errors);
    }

    // Check if email already exists
    const existingUser = await prisma.companyUser.findFirst({
      where: {
        email: data.email.toLowerCase(),
        companyId: data.companyId,
      },
    });

    if (existingUser) {
      throw new ValidationError("Email already exists in this company");
    }

    // Hash password
    const hashedPassword = await PasswordUtils.hash(data.password);

    // Create user
    const user = await prisma.companyUser.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        isActive: data.isActive ?? true,
        companyId: data.companyId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    logger.info(`Company user created: ${user.email} in company ${data.companyId}`);
    return user;
  }

  /**
   * Get all users for a company
   */
  async getUsers(filters: CompanyUserFilters): Promise<CompanyUserListResponse> {
    const { page, limit, search, role, isActive, companyId } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      companyId,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Get users and total count
    const [users, total] = await Promise.all([
      prisma.companyUser.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.companyUser.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string, companyId: string): Promise<any> {
    const user = await prisma.companyUser.findFirst({
      where: {
        id: userId,
        companyId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  }

  /**
   * Update user
   */
  async updateUser(
    userId: string,
    data: CompanyUserUpdateData,
    companyId: string
  ): Promise<any> {
    // Check if user exists
    const existingUser = await prisma.companyUser.findFirst({
      where: {
        id: userId,
        companyId,
      },
    });

    if (!existingUser) {
      throw new AppError("User not found", 404);
    }

    // Update user
    const user = await prisma.companyUser.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    logger.info(`Company user updated: ${user.email}`);
    return user;
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    newPassword: string,
    companyId: string
  ): Promise<void> {
    // Validate password
    const passwordValidation = PasswordUtils.validate(newPassword);
    if (!passwordValidation.isValid) {
      throw new ValidationError("Invalid password", passwordValidation.errors);
    }

    // Check if user exists
    const existingUser = await prisma.companyUser.findFirst({
      where: {
        id: userId,
        companyId,
      },
    });

    if (!existingUser) {
      throw new AppError("User not found", 404);
    }

    // Hash new password
    const hashedPassword = await PasswordUtils.hash(newPassword);

    // Update password
    await prisma.companyUser.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    logger.info(`Password changed for company user: ${userId}`);
  }

  /**
   * Deactivate user (soft delete)
   */
  async deactivateUser(userId: string, companyId: string): Promise<void> {
    const user = await prisma.companyUser.findFirst({
      where: {
        id: userId,
        companyId,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    await prisma.companyUser.update({
      where: { id: userId },
      data: { isActive: false },
    });

    logger.info(`Company user deactivated: ${user.email}`);
  }

  /**
   * Activate user
   */
  async activateUser(userId: string, companyId: string): Promise<void> {
    const user = await prisma.companyUser.findFirst({
      where: {
        id: userId,
        companyId,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    await prisma.companyUser.update({
      where: { id: userId },
      data: { isActive: true },
    });

    logger.info(`Company user activated: ${user.email}`);
  }

  /**
   * Delete user (hard delete)
   */
  async deleteUser(userId: string, companyId: string): Promise<void> {
    const user = await prisma.companyUser.findFirst({
      where: {
        id: userId,
        companyId,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    await prisma.companyUser.delete({
      where: { id: userId },
    });

    logger.info(`Company user deleted: ${user.email}`);
  }

  /**
   * Get user statistics for company
   */
  async getUserStatistics(companyId: string): Promise<any> {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      usersByRole,
      recentUsers,
    ] = await Promise.all([
      prisma.companyUser.count({
        where: { companyId },
      }),
      prisma.companyUser.count({
        where: { companyId, isActive: true },
      }),
      prisma.companyUser.count({
        where: { companyId, isActive: false },
      }),
      prisma.companyUser.groupBy({
        by: ["role"],
        where: { companyId },
        _count: { role: true },
      }),
      prisma.companyUser.findMany({
        where: { companyId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      usersByRole: usersByRole.map((item) => ({
        role: item.role,
        count: item._count.role,
      })),
      recentUsers,
    };
  }
}
