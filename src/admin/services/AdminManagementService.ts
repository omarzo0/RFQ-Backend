import { prisma } from "../../app";
import { AppError, ValidationError } from "../../utils/errors";
import logger from "../../utils/logger";
import bcrypt from "bcryptjs";
import { AdminRole } from "@prisma/client";

export interface AdminCreateData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  isActive?: boolean;
}

export interface AdminUpdateData {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: AdminRole;
  isActive?: boolean;
}

export interface AdminListFilters {
  page?: number;
  limit?: number;
  role?: AdminRole;
  isActive?: boolean;
  search?: string;
}

export interface AdminListResponse {
  admins: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: AdminRole;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class AdminManagementService {
  /**
   * Create a new admin
   */
  async createAdmin(data: AdminCreateData) {
    try {
      // Check if admin with email already exists
      const existingAdmin = await prisma.admin.findUnique({
        where: { email: data.email },
      });

      if (existingAdmin) {
        throw new ValidationError("Admin with this email already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Create admin
      const admin = await prisma.admin.create({
        data: {
          email: data.email,
          passwordHash: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          isActive: data.isActive ?? true,
        },
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

      logger.info(`Admin created: ${admin.email} with role ${admin.role}`);

      return admin;
    } catch (error) {
      logger.error("Error creating admin:", error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new AppError("Failed to create admin", 500);
    }
  }

  /**
   * Get all admins with filtering and pagination
   */
  async getAdmins(filters: AdminListFilters = {}): Promise<AdminListResponse> {
    try {
      const { page = 1, limit = 20, role, isActive, search } = filters;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (role) {
        where.role = role;
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (search) {
        where.OR = [
          { email: { contains: search, mode: "insensitive" } },
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
        ];
      }

      const [admins, total] = await Promise.all([
        prisma.admin.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
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
        }),
        prisma.admin.count({ where }),
      ]);

      return {
        admins,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error("Error getting admins:", error);
      throw new AppError("Failed to get admins", 500);
    }
  }

  /**
   * Get admin by ID
   */
  async getAdminById(adminId: string) {
    try {
      const admin = await prisma.admin.findUnique({
        where: { id: adminId },
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

      return admin;
    } catch (error) {
      logger.error("Error getting admin by ID:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to get admin", 500);
    }
  }

  /**
   * Update admin
   */
  async updateAdmin(adminId: string, data: AdminUpdateData) {
    try {
      const existingAdmin = await prisma.admin.findUnique({
        where: { id: adminId },
      });

      if (!existingAdmin) {
        throw new AppError("Admin not found", 404);
      }

      // Check if email is being changed and if it already exists
      if (data.email && data.email !== existingAdmin.email) {
        const emailExists = await prisma.admin.findUnique({
          where: { email: data.email },
        });

        if (emailExists) {
          throw new ValidationError("Admin with this email already exists");
        }
      }

      const updatedAdmin = await prisma.admin.update({
        where: { id: adminId },
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          isActive: data.isActive,
        },
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

      logger.info(`Admin updated: ${updatedAdmin.email}`);

      return updatedAdmin;
    } catch (error) {
      logger.error("Error updating admin:", error);
      if (error instanceof AppError || error instanceof ValidationError) {
        throw error;
      }
      throw new AppError("Failed to update admin", 500);
    }
  }

  /**
   * Delete admin (soft delete by setting isActive to false)
   */
  async deleteAdmin(adminId: string) {
    try {
      const existingAdmin = await prisma.admin.findUnique({
        where: { id: adminId },
      });

      if (!existingAdmin) {
        throw new AppError("Admin not found", 404);
      }

      // Check if trying to delete super admin
      if (existingAdmin.role === "SUPER_ADMIN") {
        throw new ValidationError("Cannot delete super admin");
      }

      const deletedAdmin = await prisma.admin.update({
        where: { id: adminId },
        data: { isActive: false },
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

      logger.info(`Admin deactivated: ${deletedAdmin.email}`);

      return deletedAdmin;
    } catch (error) {
      logger.error("Error deleting admin:", error);
      if (error instanceof AppError || error instanceof ValidationError) {
        throw error;
      }
      throw new AppError("Failed to delete admin", 500);
    }
  }

  /**
   * Restore admin (reactivate)
   */
  async restoreAdmin(adminId: string) {
    try {
      const existingAdmin = await prisma.admin.findUnique({
        where: { id: adminId },
      });

      if (!existingAdmin) {
        throw new AppError("Admin not found", 404);
      }

      const restoredAdmin = await prisma.admin.update({
        where: { id: adminId },
        data: { isActive: true },
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

      logger.info(`Admin restored: ${restoredAdmin.email}`);

      return restoredAdmin;
    } catch (error) {
      logger.error("Error restoring admin:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to restore admin", 500);
    }
  }

  /**
   * Change admin password
   */
  async changeAdminPassword(adminId: string, newPassword: string) {
    try {
      const existingAdmin = await prisma.admin.findUnique({
        where: { id: adminId },
      });

      if (!existingAdmin) {
        throw new AppError("Admin not found", 404);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await prisma.admin.update({
        where: { id: adminId },
        data: { passwordHash: hashedPassword },
      });

      logger.info(`Password changed for admin: ${existingAdmin.email}`);

      return { message: "Password changed successfully" };
    } catch (error) {
      logger.error("Error changing admin password:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to change admin password", 500);
    }
  }

  /**
   * Get admin statistics
   */
  async getAdminStatistics() {
    try {
      const [
        totalAdmins,
        activeAdmins,
        inactiveAdmins,
        superAdmins,
        regularAdmins,
        recentLogins,
      ] = await Promise.all([
        prisma.admin.count(),
        prisma.admin.count({ where: { isActive: true } }),
        prisma.admin.count({ where: { isActive: false } }),
        prisma.admin.count({ where: { role: "SUPER_ADMIN" } }),
        prisma.admin.count({ where: { role: "ADMIN" } }),
        prisma.admin.count({
          where: {
            lastLoginAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        }),
      ]);

      return {
        totalAdmins,
        activeAdmins,
        inactiveAdmins,
        superAdmins,
        regularAdmins,
        recentLogins,
        roleDistribution: {
          superAdmins,
          regularAdmins,
        },
      };
    } catch (error) {
      logger.error("Error getting admin statistics:", error);
      throw new AppError("Failed to get admin statistics", 500);
    }
  }

  /**
   * Get admin activity logs (if you have an activity log table)
   */
  async getAdminActivityLogs(adminId: string, limit: number = 50) {
    try {
      // This is a placeholder - you'd implement actual activity logging
      // For now, return empty array
      return [];
    } catch (error) {
      logger.error("Error getting admin activity logs:", error);
      throw new AppError("Failed to get admin activity logs", 500);
    }
  }

  /**
   * Validate admin data
   */
  private validateAdminData(data: AdminCreateData | AdminUpdateData) {
    if (data.email && !this.isValidEmail(data.email)) {
      throw new ValidationError("Invalid email format");
    }

    if (data.firstName && data.firstName.trim().length < 2) {
      throw new ValidationError("First name must be at least 2 characters");
    }

    if (data.lastName && data.lastName.trim().length < 2) {
      throw new ValidationError("Last name must be at least 2 characters");
    }

    if (data.role && !["ADMIN", "SUPER_ADMIN"].includes(data.role)) {
      throw new ValidationError("Invalid admin role");
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
