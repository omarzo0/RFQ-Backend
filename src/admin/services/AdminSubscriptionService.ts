import { prisma } from "../../app";
import { AppError, ValidationError } from "../../utils/errors";
import logger from "../../utils/logger";

export interface SubscriptionUpdateData {
  subscriptionPlan?: string;
  subscriptionStatus?:
    | "ACTIVE"
    | "INACTIVE"
    | "SUSPENDED"
    | "CANCELED"
    | "TRIAL";
  trialEndsAt?: Date;
  billingCycle?: "MONTHLY" | "YEARLY";
  monthlyFee?: number;
  features?: string[];
  limits?: {
    maxUsers?: number;
    maxRFQs?: number;
    maxEmails?: number;
    maxStorage?: number;
  };
}

export interface SubscriptionAnalytics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  expiredSubscriptions: number;
  canceledSubscriptions: number;
  revenue: {
    monthly: number;
    yearly: number;
    total: number;
  };
  planDistribution: {
    plan: string;
    count: number;
    percentage: number;
  }[];
  churnRate: number;
  renewalRate: number;
}

export class AdminSubscriptionService {
  /**
   * Get all subscriptions with filtering and pagination
   */
  async getSubscriptions(
    filters: {
      page?: number;
      limit?: number;
      status?: string;
      plan?: string;
      search?: string;
    } = {}
  ) {
    const { page = 1, limit = 20, status, plan, search } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.subscriptionStatus = status;
    }

    if (plan) {
      where.subscriptionPlan = plan;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

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
          subscriptionPlan: true,
          subscriptionStatus: true,
          trialEndsAt: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              users: true,
              rfqs: true,
              quotes: true,
            },
          },
        },
      }),
      prisma.company.count({ where }),
    ]);

    return {
      subscriptions: companies,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get subscription by company ID
   */
  async getSubscriptionByCompanyId(companyId: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
            rfqs: true,
            quotes: true,
            emailLogs: true,
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
   * Update subscription
   */
  async updateSubscription(companyId: string, data: SubscriptionUpdateData) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new AppError("Company not found", 404);
    }

    // Validate subscription status transition
    if (data.subscriptionStatus) {
      const validTransitions = this.getValidStatusTransitions(
        company.subscriptionStatus
      );
      if (!validTransitions.includes(data.subscriptionStatus)) {
        throw new ValidationError(
          `Invalid status transition from ${company.subscriptionStatus} to ${data.subscriptionStatus}`
        );
      }
    }

    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        subscriptionPlan: data.subscriptionPlan,
        subscriptionStatus: data.subscriptionStatus,
        trialEndsAt: data.trialEndsAt,
        // Add other fields as needed
      },
    });

    logger.info(
      `Subscription updated for company ${companyId}: ${JSON.stringify(data)}`
    );

    return updatedCompany;
  }

  /**
   * Suspend subscription
   */
  async suspendSubscription(companyId: string, reason?: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new AppError("Company not found", 404);
    }

    if (company.subscriptionStatus === "SUSPENDED") {
      throw new ValidationError("Subscription is already suspended");
    }

    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        subscriptionStatus: "SUSPENDED",
        // You might want to add a suspension reason field
      },
    });

    logger.info(
      `Subscription suspended for company ${companyId}. Reason: ${
        reason || "No reason provided"
      }`
    );

    return updatedCompany;
  }

  /**
   * Reactivate subscription
   */
  async reactivateSubscription(companyId: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new AppError("Company not found", 404);
    }

    if (company.subscriptionStatus !== "SUSPENDED") {
      throw new ValidationError(
        "Only suspended subscriptions can be reactivated"
      );
    }

    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        subscriptionStatus: "ACTIVE",
      },
    });

    logger.info(`Subscription reactivated for company ${companyId}`);

    return updatedCompany;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(companyId: string, reason?: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new AppError("Company not found", 404);
    }

    if (company.subscriptionStatus === "CANCELED") {
      throw new ValidationError("Subscription is already canceled");
    }

    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        subscriptionStatus: "CANCELED",
        // You might want to add a cancellation reason field
      },
    });

    logger.info(
      `Subscription canceled for company ${companyId}. Reason: ${
        reason || "No reason provided"
      }`
    );

    return updatedCompany;
  }

  /**
   * Extend trial period
   */
  async extendTrial(companyId: string, days: number) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new AppError("Company not found", 404);
    }

    if (company.subscriptionStatus !== "TRIAL") {
      throw new ValidationError("Only trial subscriptions can be extended");
    }

    const newTrialEndsAt = new Date(company.trialEndsAt || new Date());
    newTrialEndsAt.setDate(newTrialEndsAt.getDate() + days);

    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        trialEndsAt: newTrialEndsAt,
      },
    });

    logger.info(`Trial extended for company ${companyId} by ${days} days`);

    return updatedCompany;
  }

  /**
   * Get subscription analytics
   */
  async getSubscriptionAnalytics(): Promise<SubscriptionAnalytics> {
    const [
      totalSubscriptions,
      activeSubscriptions,
      trialSubscriptions,
      expiredSubscriptions,
      canceledSubscriptions,
      planDistribution,
    ] = await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { subscriptionStatus: "ACTIVE" } }),
      prisma.company.count({ where: { subscriptionStatus: "TRIAL" } }),
      prisma.company.count({ where: { subscriptionStatus: "EXPIRED" } }),
      prisma.company.count({ where: { subscriptionStatus: "CANCELED" } }),
      prisma.company.groupBy({
        by: ["subscriptionPlan"],
        _count: { subscriptionPlan: true },
      }),
    ]);

    // Calculate plan distribution percentages
    const planDistributionWithPercentage = planDistribution.map((plan) => ({
      plan: plan.subscriptionPlan,
      count: plan._count.subscriptionPlan,
      percentage:
        totalSubscriptions > 0
          ? (plan._count.subscriptionPlan / totalSubscriptions) * 100
          : 0,
    }));

    // Mock revenue calculation (you'd implement real billing logic)
    const revenue = {
      monthly: 0,
      yearly: 0,
      total: 0,
    };

    // Calculate churn rate (mock implementation)
    const churnRate =
      totalSubscriptions > 0
        ? (canceledSubscriptions / totalSubscriptions) * 100
        : 0;
    const renewalRate =
      totalSubscriptions > 0
        ? (activeSubscriptions / totalSubscriptions) * 100
        : 0;

    return {
      totalSubscriptions,
      activeSubscriptions,
      trialSubscriptions,
      expiredSubscriptions,
      canceledSubscriptions,
      revenue,
      planDistribution: planDistributionWithPercentage,
      churnRate,
      renewalRate,
    };
  }

  /**
   * Get expiring trials
   */
  async getExpiringTrials(days: number = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const expiringTrials = await prisma.company.findMany({
      where: {
        subscriptionStatus: "TRIAL",
        trialEndsAt: {
          lte: futureDate,
          gte: new Date(),
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        trialEndsAt: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
            rfqs: true,
          },
        },
      },
      orderBy: { trialEndsAt: "asc" },
    });

    return expiringTrials;
  }

  /**
   * Get subscription usage for a company
   */
  async getSubscriptionUsage(companyId: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        _count: {
          select: {
            users: true,
            rfqs: true,
            quotes: true,
            emailLogs: true,
            contacts: true,
            shippingLines: true,
          },
        },
      },
    });

    if (!company) {
      throw new AppError("Company not found", 404);
    }

    // Mock limits based on subscription plan
    const limits = this.getPlanLimits(company.subscriptionPlan);

    return {
      company: {
        id: company.id,
        name: company.name,
        subscriptionPlan: company.subscriptionPlan,
        subscriptionStatus: company.subscriptionStatus,
      },
      usage: {
        users: company._count.users,
        rfqs: company._count.rfqs,
        quotes: company._count.quotes,
        emails: company._count.emailLogs,
        contacts: company._count.contacts,
        shippingLines: company._count.shippingLines,
      },
      limits,
      utilization: {
        users: limits.maxUsers
          ? (company._count.users / limits.maxUsers) * 100
          : 0,
        rfqs: limits.maxRFQs ? (company._count.rfqs / limits.maxRFQs) * 100 : 0,
        emails: limits.maxEmails
          ? (company._count.emailLogs / limits.maxEmails) * 100
          : 0,
      },
    };
  }

  /**
   * Get valid status transitions
   */
  private getValidStatusTransitions(currentStatus: string): string[] {
    const transitions: { [key: string]: string[] } = {
      TRIAL: ["ACTIVE", "CANCELED"],
      ACTIVE: ["SUSPENDED", "CANCELED"],
      SUSPENDED: ["ACTIVE", "CANCELED"],
      CANCELED: ["ACTIVE"],
      EXPIRED: ["ACTIVE", "CANCELED"],
    };

    return transitions[currentStatus] || [];
  }

  /**
   * Get plan limits
   */
  private getPlanLimits(plan: string) {
    const limits: { [key: string]: any } = {
      trial: {
        maxUsers: 3,
        maxRFQs: 10,
        maxEmails: 100,
        maxStorage: 1000, // MB
      },
      basic: {
        maxUsers: 10,
        maxRFQs: 100,
        maxEmails: 1000,
        maxStorage: 5000,
      },
      professional: {
        maxUsers: 50,
        maxRFQs: 500,
        maxEmails: 5000,
        maxStorage: 25000,
      },
      enterprise: {
        maxUsers: -1, // Unlimited
        maxRFQs: -1,
        maxEmails: -1,
        maxStorage: -1,
      },
    };

    return limits[plan] || limits["trial"];
  }
}
