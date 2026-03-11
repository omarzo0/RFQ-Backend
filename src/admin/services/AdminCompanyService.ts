import { prisma } from "../../app";
import { AppError, ValidationError } from "../../utils/errors";
import logger from "../../utils/logger";
import {
  CreateCompanyData,
  UpdateCompanyData,
  CompanyListResponse,
  AdminDashboardStats,
} from "../types/auth";

export class AdminCompanyService {
  /**
   * Create a new company
   */
  async createCompany(data: CreateCompanyData) {
    // Check if company email already exists
    const existingCompany = await prisma.company.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingCompany) {
      throw new ValidationError("Company email already exists");
    }

    // Create company
    const company = await prisma.company.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        domain: data.domain,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
        timezone: data.timezone || "UTC",
        subscriptionPlan: data.subscriptionPlan || "trial",
        subscriptionStatus: data.subscriptionStatus || "ACTIVE",
        trialEndsAt:
          data.trialEndsAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        emailFooter: data.emailFooter,
        defaultFollowUpDays: data.defaultFollowUpDays || 3,
        autoFollowUpEnabled: data.autoFollowUpEnabled !== false,
      },
    });

    logger.info(`New company created: ${company.name} (${company.email})`);

    return company;
  }

  /**
   * Get all companies with pagination
   */
  async getCompanies(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string
  ): Promise<CompanyListResponse> {
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { domain: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.subscriptionStatus = status;
    }

    // Get companies with user count
    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          domain: true,
          phone: true,
          subscriptionPlan: true,
          subscriptionStatus: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          users: {
            select: {
              id: true,
              lastLoginAt: true,
            },
          },
        },
      }),
      prisma.company.count({ where }),
    ]);

    // Get last activity for each company
    const companiesWithStats = await Promise.all(
      companies.map(async (company) => {
        const lastActivity = await prisma.rFQ.findFirst({
          where: { companyId: company.id },
          orderBy: { updatedAt: "desc" },
          select: { updatedAt: true },
        });

        return {
          ...company,
          userCount: company.users.length,
          lastActivityAt: lastActivity?.updatedAt || company.updatedAt,
          domain: company.domain || undefined,
          phone: company.phone || undefined,
        };
      })
    );

    return {
      companies: companiesWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get company by ID
   */
  async getCompanyById(companyId: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            rfqs: true,
            contacts: true,
            shippingLines: true,
          },
        },
      },
    });

    if (!company) {
      throw new AppError("Company not found", 404);
    }

    return company;
  }

  /**
   * Update company
   */
  async updateCompany(data: UpdateCompanyData) {
    const { id, ...updateData } = data;

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id },
    });

    if (!existingCompany) {
      throw new AppError("Company not found", 404);
    }

    // Check if email is being changed and if it's already taken
    if (updateData.email && updateData.email !== existingCompany.email) {
      const emailExists = await prisma.company.findUnique({
        where: { email: updateData.email.toLowerCase() },
      });

      if (emailExists) {
        throw new ValidationError("Company email already exists");
      }
    }

    // Only pick fields that exist on the Company model
    const allowedFields = [
      "name",
      "email",
      "domain",
      "phone",
      "address",
      "city",
      "country",
      "timezone",
      "subscriptionPlan",
      "subscriptionStatus",
      "trialEndsAt",
      "emailFooter",
      "defaultFollowUpDays",
      "autoFollowUpEnabled",
      "isActive",
    ] as const;

    const sanitizedData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in updateData && (updateData as Record<string, unknown>)[key] !== undefined) {
        sanitizedData[key] = (updateData as Record<string, unknown>)[key];
      }
    }

    if (sanitizedData.email) {
      sanitizedData.email = (sanitizedData.email as string).toLowerCase();
    }

    // Update company
    const updatedCompany = await prisma.company.update({
      where: { id },
      data: sanitizedData,
    });

    logger.info(
      `Company updated: ${updatedCompany.name} (${updatedCompany.email})`
    );

    return updatedCompany;
  }

  /**
   * Delete company (soft delete)
   */
  async deleteCompany(companyId: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new AppError("Company not found", 404);
    }

    // Soft delete by setting isActive to false
    const deletedCompany = await prisma.company.update({
      where: { id: companyId },
      data: { isActive: false },
    });

    logger.info(
      `Company deleted: ${deletedCompany.name} (${deletedCompany.email})`
    );

    return deletedCompany;
  }

  /**
   * Restore company
   */
  async restoreCompany(companyId: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new AppError("Company not found", 404);
    }

    const restoredCompany = await prisma.company.update({
      where: { id: companyId },
      data: { isActive: true },
    });

    logger.info(
      `Company restored: ${restoredCompany.name} (${restoredCompany.email})`
    );

    return restoredCompany;
  }

  /**
   * Get admin dashboard statistics
   */
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const [
      totalCompanies,
      activeCompanies,
      totalUsers,
      totalRFQs,
      totalQuotes,
    ] = await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { isActive: true } }),
      prisma.companyUser.count({ where: { isActive: true } }),
      prisma.rFQ.count(),
      prisma.quote.count(),
    ]);

    // Get recent activity
    const recentActivity = await prisma.rFQ.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        company: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      totalCompanies,
      activeCompanies,
      totalUsers,
      totalRFQs,
      totalQuotes,
      recentActivity: recentActivity.map((activity: any) => ({
        id: activity.id,
        type: "RFQ",
        description: `RFQ "${activity.title}" ${activity.status.toLowerCase()}`,
        timestamp: activity.createdAt,
        companyName: activity.company.name,
      })),
    };
  }

  /**
   * Create a company user
   */
  async createCompanyUser(data: {
    email: string;
    password: string;
    companyId: string;
    firstName: string;
    lastName: string;
    role?: string;
  }) {
    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: data.companyId },
    });

    if (!company) {
      throw new ValidationError("Company not found");
    }

    // Check if user email already exists within the same company
    const existingUser = await prisma.companyUser.findUnique({
      where: {
        companyId_email: {
          companyId: data.companyId,
          email: data.email.toLowerCase(),
        },
      },
    });

    if (existingUser) {
      throw new ValidationError("User email already exists in this company");
    }

    // Hash password
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create company user
    const companyUser = await prisma.companyUser.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: (data.role as "ADMIN" | "MANAGER" | "EMPLOYEE") || "EMPLOYEE",
        companyId: data.companyId,
        isActive: true,
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
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    logger.info(
      `New company user created: ${companyUser.email} for company ${company.name}`
    );

    return companyUser;
  }

  /**
   * Get company users with pagination
   */
  async getCompanyUsers(
    companyId: string,
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new ValidationError("Company not found");
    }

    const [users, total] = await Promise.all([
      prisma.companyUser.findMany({
        where: { companyId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.companyUser.count({
        where: { companyId },
      }),
    ]);

    return {
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit,
      },
    };
  }

  /**
   * Update company user
   */
  async updateCompanyUser(userId: string, updateData: any) {
    // Check if user exists
    const existingUser = await prisma.companyUser.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new ValidationError("User not found");
    }

    // If password is being updated, hash it
    if (updateData.password) {
      const bcrypt = require("bcryptjs");
      updateData.passwordHash = await bcrypt.hash(updateData.password, 12);
      delete updateData.password; // Remove the plain password field
    }

    // Update user
    const updatedUser = await prisma.companyUser.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    logger.info(`Company user updated: ${updatedUser.email}`);

    return updatedUser;
  }

  /**
   * Delete company user
   */
  async deleteCompanyUser(userId: string) {
    // Check if user exists
    const existingUser = await prisma.companyUser.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new ValidationError("User not found");
    }

    // Soft delete user
    await prisma.companyUser.update({
      where: { id: userId },
      data: { isActive: false },
    });

    logger.info(`Company user deleted: ${existingUser.email}`);

    return { message: "User deleted successfully" };
  }
}
