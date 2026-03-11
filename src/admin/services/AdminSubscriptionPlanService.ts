import { prisma } from "../../app";
import { AppError, ValidationError } from "../../utils/errors";
import logger from "../../utils/logger";

export interface SubscriptionPlanCreateData {
  name: string;
  description?: string;
  priceMonthly?: number;
  priceYearly?: number;
  maxUsers?: number;
  maxRFQsPerMonth?: number;
  maxContacts?: number;
  maxEmailSendsPerMonth?: number;
  features?: any;
  isActive?: boolean;
}

export interface SubscriptionPlanUpdateData {
  name?: string;
  description?: string;
  priceMonthly?: number;
  priceYearly?: number;
  maxUsers?: number;
  maxRFQsPerMonth?: number;
  maxContacts?: number;
  maxEmailSendsPerMonth?: number;
  features?: any;
  isActive?: boolean;
}

export interface SubscriptionPlanFilters {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}

export interface SubscriptionPlanUsageStats {
  planId: string;
  planName: string;
  totalCompanies: number;
  activeCompanies: number;
  inactiveCompanies: number;
  suspendedCompanies: number;
  canceledCompanies: number;
  totalRevenue: number;
  averageRevenuePerCompany: number;
  companiesByStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];
}

export class AdminSubscriptionPlanService {
  static readonly DEFAULT_TRIAL_PLAN_NAME = "trial";

  /**
   * Ensure the default trial plan exists in the database.
   * Creates it if missing. Returns the trial plan record.
   */
  async ensureDefaultTrialPlan() {
    const existing = await prisma.subscriptionPlan.findFirst({
      where: { name: AdminSubscriptionPlanService.DEFAULT_TRIAL_PLAN_NAME },
    });

    if (existing) return existing;

    const trialPlan = await prisma.subscriptionPlan.create({
      data: {
        name: AdminSubscriptionPlanService.DEFAULT_TRIAL_PLAN_NAME,
        description: "Free 30-day trial with limited features",
        priceMonthly: 0,
        priceYearly: 0,
        maxUsers: 3,
        maxRFQsPerMonth: 50,
        maxContacts: 100,
        maxEmailSendsPerMonth: 200,
        features: {
          basicRFQ: true,
          basicQuotes: true,
          emailSupport: true,
        },
        isActive: true,
      },
    });

    logger.info("Default trial subscription plan created automatically");
    return trialPlan;
  }
  /**
   * Get all subscription plans with filtering and pagination.
   * The default trial plan is always ensured to exist.
   */
  async getSubscriptionPlans(filters: SubscriptionPlanFilters = {}) {
    // Ensure trial plan always exists
    await this.ensureDefaultTrialPlan();

    const { page = 1, limit = 20, isActive, search } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [subscriptionPlans, total] = await Promise.all([
      prisma.subscriptionPlan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.subscriptionPlan.count({ where }),
    ]);

    // Get usage statistics for each plan
    const plansWithUsage = await Promise.all(
      subscriptionPlans.map(async (plan) => {
        const usageStats = await this.getPlanUsageStats(plan.id);
        return {
          ...plan,
          isDefault: plan.name === AdminSubscriptionPlanService.DEFAULT_TRIAL_PLAN_NAME,
          usageStats,
        };
      })
    );

    return {
      subscriptionPlans: plansWithUsage,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get subscription plan by ID
   */
  async getSubscriptionPlanById(id: string) {
    const subscriptionPlan = await prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    if (!subscriptionPlan) {
      throw new AppError("Subscription plan not found", 404);
    }

    // Get usage statistics
    const usageStats = await this.getPlanUsageStats(id);

    return {
      ...subscriptionPlan,
      isDefault: subscriptionPlan.name === AdminSubscriptionPlanService.DEFAULT_TRIAL_PLAN_NAME,
      usageStats,
    };
  }

  /**
   * Create new subscription plan
   */
  async createSubscriptionPlan(data: SubscriptionPlanCreateData) {
    try {
      // Validate required fields
      if (!data.name || data.name.trim().length === 0) {
        throw new ValidationError("Plan name is required");
      }

      // Check if plan with same name already exists
      const existingPlan = await prisma.subscriptionPlan.findFirst({
        where: { name: data.name },
      });

      if (existingPlan) {
        throw new ValidationError(
          "A subscription plan with this name already exists"
        );
      }

      // Validate pricing
      if (data.priceMonthly !== undefined && data.priceMonthly < 0) {
        throw new ValidationError("Monthly price cannot be negative");
      }

      if (data.priceYearly !== undefined && data.priceYearly < 0) {
        throw new ValidationError("Yearly price cannot be negative");
      }

      // Validate limits
      if (data.maxUsers !== undefined && data.maxUsers < 0) {
        throw new ValidationError("Max users cannot be negative");
      }

      if (data.maxRFQsPerMonth !== undefined && data.maxRFQsPerMonth < 0) {
        throw new ValidationError("Max RFQs per month cannot be negative");
      }

      if (data.maxContacts !== undefined && data.maxContacts < 0) {
        throw new ValidationError("Max contacts cannot be negative");
      }

      if (
        data.maxEmailSendsPerMonth !== undefined &&
        data.maxEmailSendsPerMonth < 0
      ) {
        throw new ValidationError(
          "Max email sends per month cannot be negative"
        );
      }

      const subscriptionPlan = await prisma.subscriptionPlan.create({
        data: {
          name: data.name.trim(),
          description: data.description?.trim(),
          priceMonthly: data.priceMonthly,
          priceYearly: data.priceYearly,
          maxUsers: data.maxUsers,
          maxRFQsPerMonth: data.maxRFQsPerMonth,
          maxContacts: data.maxContacts,
          maxEmailSendsPerMonth: data.maxEmailSendsPerMonth,
          features: data.features || {},
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
      });

      logger.info(`Subscription plan created: ${subscriptionPlan.id}`);
      return subscriptionPlan;
    } catch (error) {
      if (error instanceof AppError || error instanceof ValidationError) {
        throw error;
      }
      logger.error("Error creating subscription plan:", error);
      throw new AppError("Failed to create subscription plan", 500);
    }
  }

  /**
   * Update subscription plan
   */
  async updateSubscriptionPlan(id: string, data: SubscriptionPlanUpdateData) {
    try {
      // Check if plan exists
      const existingPlan = await prisma.subscriptionPlan.findUnique({
        where: { id },
      });

      if (!existingPlan) {
        throw new AppError("Subscription plan not found", 404);
      }

      // Validate pricing
      if (data.priceMonthly !== undefined && data.priceMonthly < 0) {
        throw new ValidationError("Monthly price cannot be negative");
      }

      if (data.priceYearly !== undefined && data.priceYearly < 0) {
        throw new ValidationError("Yearly price cannot be negative");
      }

      // Validate limits
      if (data.maxUsers !== undefined && data.maxUsers < 0) {
        throw new ValidationError("Max users cannot be negative");
      }

      if (data.maxRFQsPerMonth !== undefined && data.maxRFQsPerMonth < 0) {
        throw new ValidationError("Max RFQs per month cannot be negative");
      }

      if (data.maxContacts !== undefined && data.maxContacts < 0) {
        throw new ValidationError("Max contacts cannot be negative");
      }

      if (
        data.maxEmailSendsPerMonth !== undefined &&
        data.maxEmailSendsPerMonth < 0
      ) {
        throw new ValidationError(
          "Max email sends per month cannot be negative"
        );
      }

      // Prevent renaming the default trial plan
      if (
        existingPlan.name === AdminSubscriptionPlanService.DEFAULT_TRIAL_PLAN_NAME &&
        data.name &&
        data.name.trim().toLowerCase() !== AdminSubscriptionPlanService.DEFAULT_TRIAL_PLAN_NAME
      ) {
        throw new ValidationError(
          "Cannot rename the default trial plan. Its name must remain 'trial'."
        );
      }

      // Check if name is being changed and if it conflicts with existing plan
      if (data.name && data.name !== existingPlan.name) {
        const conflictingPlan = await prisma.subscriptionPlan.findFirst({
          where: {
            name: data.name,
            id: { not: id },
          },
        });

        if (conflictingPlan) {
          throw new ValidationError(
            "A subscription plan with this name already exists"
          );
        }
      }

      const updateData: any = {};

      if (data.name !== undefined) updateData.name = data.name.trim();
      if (data.description !== undefined)
        updateData.description = data.description?.trim();
      if (data.priceMonthly !== undefined)
        updateData.priceMonthly = data.priceMonthly;
      if (data.priceYearly !== undefined)
        updateData.priceYearly = data.priceYearly;
      if (data.maxUsers !== undefined) updateData.maxUsers = data.maxUsers;
      if (data.maxRFQsPerMonth !== undefined)
        updateData.maxRFQsPerMonth = data.maxRFQsPerMonth;
      if (data.maxContacts !== undefined)
        updateData.maxContacts = data.maxContacts;
      if (data.maxEmailSendsPerMonth !== undefined)
        updateData.maxEmailSendsPerMonth = data.maxEmailSendsPerMonth;
      if (data.features !== undefined) updateData.features = data.features;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      const subscriptionPlan = await prisma.subscriptionPlan.update({
        where: { id },
        data: updateData,
      });

      logger.info(`Subscription plan updated: ${subscriptionPlan.id}`);
      return subscriptionPlan;
    } catch (error) {
      if (error instanceof AppError || error instanceof ValidationError) {
        throw error;
      }
      logger.error("Error updating subscription plan:", error);
      throw new AppError("Failed to update subscription plan", 500);
    }
  }

  /**
   * Delete subscription plan
   */
  async deleteSubscriptionPlan(id: string) {
    try {
      // Check if plan exists
      const existingPlan = await prisma.subscriptionPlan.findUnique({
        where: { id },
      });

      if (!existingPlan) {
        throw new AppError("Subscription plan not found", 404);
      }

      // Prevent deletion of the default trial plan
      if (existingPlan.name === AdminSubscriptionPlanService.DEFAULT_TRIAL_PLAN_NAME) {
        throw new ValidationError(
          "Cannot delete the default trial plan. It is required by the system."
        );
      }

      // Check if any companies are using this plan
      const companiesUsingPlan = await prisma.company.count({
        where: { subscriptionPlan: existingPlan.name },
      });

      if (companiesUsingPlan > 0) {
        throw new ValidationError(
          `Cannot delete subscription plan. ${companiesUsingPlan} companies are currently using this plan. Please reassign them to another plan first.`
        );
      }

      await prisma.subscriptionPlan.delete({
        where: { id },
      });

      logger.info(`Subscription plan deleted: ${id}`);
    } catch (error) {
      if (error instanceof AppError || error instanceof ValidationError) {
        throw error;
      }
      logger.error("Error deleting subscription plan:", error);
      throw new AppError("Failed to delete subscription plan", 500);
    }
  }

  /**
   * Toggle subscription plan active status
   */
  async toggleSubscriptionPlanStatus(id: string) {
    try {
      const existingPlan = await prisma.subscriptionPlan.findUnique({
        where: { id },
      });

      if (!existingPlan) {
        throw new AppError("Subscription plan not found", 404);
      }

      // Prevent deactivation of the default trial plan
      if (
        existingPlan.name === AdminSubscriptionPlanService.DEFAULT_TRIAL_PLAN_NAME &&
        existingPlan.isActive
      ) {
        throw new ValidationError(
          "Cannot deactivate the default trial plan. It is required by the system."
        );
      }

      const updatedPlan = await prisma.subscriptionPlan.update({
        where: { id },
        data: { isActive: !existingPlan.isActive },
      });

      logger.info(
        `Subscription plan status toggled: ${id} -> ${
          updatedPlan.isActive ? "active" : "inactive"
        }`
      );
      return updatedPlan;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error toggling subscription plan status:", error);
      throw new AppError("Failed to toggle subscription plan status", 500);
    }
  }

  /**
   * Get subscription plan usage statistics
   */
  async getSubscriptionPlanUsage(
    id: string
  ): Promise<SubscriptionPlanUsageStats> {
    try {
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id },
      });

      if (!plan) {
        throw new AppError("Subscription plan not found", 404);
      }

      // Get companies using this plan
      const companies = await prisma.company.findMany({
        where: { subscriptionPlan: plan.name },
        select: {
          id: true,
          subscriptionStatus: true,
        },
      });

      const totalCompanies = companies.length;
      const activeCompanies = companies.filter(
        (c) => c.subscriptionStatus === "ACTIVE"
      ).length;
      const inactiveCompanies = companies.filter(
        (c) => c.subscriptionStatus === "INACTIVE"
      ).length;
      const suspendedCompanies = companies.filter(
        (c) => c.subscriptionStatus === "SUSPENDED"
      ).length;
      const canceledCompanies = companies.filter(
        (c) => c.subscriptionStatus === "CANCELED"
      ).length;

      // Calculate revenue (simplified - you might want to add actual billing data)
      const monthlyPrice = plan.priceMonthly ? Number(plan.priceMonthly) : 0;
      const totalRevenue = totalCompanies * monthlyPrice;
      const averageRevenuePerCompany =
        totalCompanies > 0 ? totalRevenue / totalCompanies : 0;

      const companiesByStatus = [
        {
          status: "ACTIVE",
          count: activeCompanies,
          percentage:
            totalCompanies > 0 ? (activeCompanies / totalCompanies) * 100 : 0,
        },
        {
          status: "INACTIVE",
          count: inactiveCompanies,
          percentage:
            totalCompanies > 0 ? (inactiveCompanies / totalCompanies) * 100 : 0,
        },
        {
          status: "SUSPENDED",
          count: suspendedCompanies,
          percentage:
            totalCompanies > 0
              ? (suspendedCompanies / totalCompanies) * 100
              : 0,
        },
        {
          status: "CANCELED",
          count: canceledCompanies,
          percentage:
            totalCompanies > 0 ? (canceledCompanies / totalCompanies) * 100 : 0,
        },
      ];

      return {
        planId: plan.id,
        planName: plan.name,
        totalCompanies,
        activeCompanies,
        inactiveCompanies,
        suspendedCompanies,
        canceledCompanies,
        totalRevenue,
        averageRevenuePerCompany,
        companiesByStatus,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error getting subscription plan usage:", error);
      throw new AppError("Failed to get subscription plan usage", 500);
    }
  }

  /**
   * Get usage statistics for a plan (helper method)
   */
  private async getPlanUsageStats(planId: string) {
    try {
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId },
      });

      if (!plan) {
        return {
          totalCompanies: 0,
          activeCompanies: 0,
          inactiveCompanies: 0,
          suspendedCompanies: 0,
          canceledCompanies: 0,
        };
      }

      const companies = await prisma.company.findMany({
        where: { subscriptionPlan: plan.name },
        select: {
          subscriptionStatus: true,
        },
      });

      return {
        totalCompanies: companies.length,
        activeCompanies: companies.filter(
          (c) => c.subscriptionStatus === "ACTIVE"
        ).length,
        inactiveCompanies: companies.filter(
          (c) => c.subscriptionStatus === "INACTIVE"
        ).length,
        suspendedCompanies: companies.filter(
          (c) => c.subscriptionStatus === "SUSPENDED"
        ).length,
        canceledCompanies: companies.filter(
          (c) => c.subscriptionStatus === "CANCELED"
        ).length,
      };
    } catch (error) {
      logger.error("Error getting plan usage stats:", error);
      return {
        totalCompanies: 0,
        activeCompanies: 0,
        inactiveCompanies: 0,
        suspendedCompanies: 0,
        canceledCompanies: 0,
      };
    }
  }
}
