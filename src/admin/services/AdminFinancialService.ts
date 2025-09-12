import { prisma } from "../../app";
import { AppError, ValidationError } from "../../utils/errors";
import logger from "../../utils/logger";
import { TransactionStatus, TransactionType } from "@prisma/client";

export interface FinancialDetailsFilters {
  page?: number;
  limit?: number;
  companyId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface FinancialAnalytics {
  totalRevenue: number;
  totalCompanies: number;
  averageRevenuePerCompany: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  refundedTransactions: number;
  averageTransactionValue: number;
  churnRate: number;
  customerLifetimeValue: number;
  revenueGrowth: {
    currentPeriod: number;
    previousPeriod: number;
    growthRate: number;
  };
  topPerformingCompanies: {
    companyId: string;
    companyName: string;
    totalRevenue: number;
    transactionCount: number;
  }[];
  revenueByMonth: {
    month: string;
    revenue: number;
    transactionCount: number;
  }[];
}

export interface RevenueTrends {
  period: string;
  data: {
    date: string;
    revenue: number;
    transactionCount: number;
    newCustomers: number;
  }[];
  summary: {
    totalRevenue: number;
    totalTransactions: number;
    totalNewCustomers: number;
    averageDailyRevenue: number;
    growthRate: number;
  };
}

export interface FinancialHealth {
  overallHealth: "excellent" | "good" | "fair" | "poor";
  metrics: {
    revenueGrowth: {
      value: number;
      status: "excellent" | "good" | "fair" | "poor";
    };
    churnRate: {
      value: number;
      status: "excellent" | "good" | "fair" | "poor";
    };
    averageTransactionValue: {
      value: number;
      status: "excellent" | "good" | "fair" | "poor";
    };
    customerLifetimeValue: {
      value: number;
      status: "excellent" | "good" | "fair" | "poor";
    };
  };
  recommendations: string[];
}

export interface FinancialDashboard {
  overview: {
    totalRevenue: number;
    monthlyRecurringRevenue: number;
    totalCustomers: number;
    activeCustomers: number;
    churnRate: number;
  };
  recentTransactions: any[];
  topCompanies: {
    companyId: string;
    companyName: string;
    revenue: number;
    growth: number;
  }[];
  revenueChart: {
    labels: string[];
    data: number[];
  };
  metrics: {
    averageTransactionValue: number;
    customerLifetimeValue: number;
    revenueGrowth: number;
    transactionSuccessRate: number;
  };
}

export class AdminFinancialService {
  /**
   * Get all financial details with filtering and pagination
   */
  async getFinancialDetails(filters: FinancialDetailsFilters = {}) {
    const {
      page = 1,
      limit = 20,
      companyId,
      sortBy = "totalRevenue",
      sortOrder = "desc",
    } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (companyId) {
      where.companyId = companyId;
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [financialDetails, total] = await Promise.all([
      prisma.financialDetails.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              email: true,
              subscriptionPlan: true,
              subscriptionStatus: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.financialDetails.count({ where }),
    ]);

    return {
      financialDetails,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get financial details by company ID
   */
  async getFinancialDetailsByCompany(companyId: string) {
    const financialDetails = await prisma.financialDetails.findUnique({
      where: { companyId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            subscriptionPlan: true,
            subscriptionStatus: true,
            createdAt: true,
          },
        },
      },
    });

    if (!financialDetails) {
      // Create financial details if they don't exist
      return await this.recalculateFinancialDetails(companyId);
    }

    return financialDetails;
  }

  /**
   * Get financial analytics and overview
   */
  async getFinancialAnalytics(filters: {
    dateFrom?: Date;
    dateTo?: Date;
    companyId?: string;
  }): Promise<FinancialAnalytics> {
    try {
      const where: any = {};

      if (filters.dateFrom || filters.dateTo) {
        where.lastUpdatedAt = {};
        if (filters.dateFrom) where.lastUpdatedAt.gte = filters.dateFrom;
        if (filters.dateTo) where.lastUpdatedAt.lte = filters.dateTo;
      }

      if (filters.companyId) {
        where.companyId = filters.companyId;
      }

      // Get financial details
      const financialDetails = await prisma.financialDetails.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Calculate totals
      const totalRevenue = financialDetails.reduce(
        (sum, fd) => sum + Number(fd.totalRevenue),
        0
      );
      const totalCompanies = financialDetails.length;
      const averageRevenuePerCompany =
        totalCompanies > 0 ? totalRevenue / totalCompanies : 0;

      const monthlyRecurringRevenue = financialDetails.reduce(
        (sum, fd) => sum + Number(fd.monthlyRecurringRevenue),
        0
      );

      const annualRecurringRevenue = financialDetails.reduce(
        (sum, fd) => sum + Number(fd.annualRecurringRevenue),
        0
      );

      const totalTransactions = financialDetails.reduce(
        (sum, fd) => sum + fd.totalTransactions,
        0
      );

      const successfulTransactions = financialDetails.reduce(
        (sum, fd) => sum + fd.successfulTransactions,
        0
      );

      const failedTransactions = financialDetails.reduce(
        (sum, fd) => sum + fd.failedTransactions,
        0
      );

      const refundedTransactions = financialDetails.reduce(
        (sum, fd) => sum + fd.refundedTransactions,
        0
      );

      const averageTransactionValue =
        totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

      const churnRate =
        financialDetails.reduce((sum, fd) => sum + Number(fd.churnRate), 0) /
        totalCompanies;

      const customerLifetimeValue =
        financialDetails.reduce(
          (sum, fd) => sum + Number(fd.customerLifetimeValue),
          0
        ) / totalCompanies;

      // Calculate revenue growth
      const currentPeriod = totalRevenue;
      const previousPeriod = await this.getPreviousPeriodRevenue(filters);
      const growthRate =
        previousPeriod > 0
          ? ((currentPeriod - previousPeriod) / previousPeriod) * 100
          : 0;

      // Top performing companies
      const topPerformingCompanies = financialDetails
        .sort((a, b) => Number(b.totalRevenue) - Number(a.totalRevenue))
        .slice(0, 10)
        .map((fd) => ({
          companyId: fd.companyId,
          companyName: fd.company.name,
          totalRevenue: Number(fd.totalRevenue),
          transactionCount: fd.totalTransactions,
        }));

      // Revenue by month (last 12 months)
      const revenueByMonth = await this.getRevenueByMonth(filters);

      return {
        totalRevenue,
        totalCompanies,
        averageRevenuePerCompany,
        monthlyRecurringRevenue,
        annualRecurringRevenue,
        totalTransactions,
        successfulTransactions,
        failedTransactions,
        refundedTransactions,
        averageTransactionValue,
        churnRate,
        customerLifetimeValue,
        revenueGrowth: {
          currentPeriod,
          previousPeriod,
          growthRate: Math.round(growthRate * 100) / 100,
        },
        topPerformingCompanies,
        revenueByMonth,
      };
    } catch (error) {
      logger.error("Error getting financial analytics:", error);
      throw new AppError("Failed to get financial analytics", 500);
    }
  }

  /**
   * Get revenue trends
   */
  async getRevenueTrends(filters: {
    period?: string;
    companyId?: string;
  }): Promise<RevenueTrends> {
    try {
      const { period = "12months", companyId } = filters;

      let dateFrom: Date;
      const dateTo = new Date();

      switch (period) {
        case "7days":
          dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30days":
          dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90days":
          dateFrom = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "12months":
        default:
          dateFrom = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
          break;
      }

      // Get transactions for the period
      const transactions = await prisma.transaction.findMany({
        where: {
          createdAt: {
            gte: dateFrom,
            lte: dateTo,
          },
          ...(companyId && { companyId }),
          status: TransactionStatus.COMPLETED,
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Group by date
      const dailyData = new Map();
      const companies = new Set();

      transactions.forEach((transaction) => {
        const date = transaction.createdAt.toISOString().split("T")[0];
        companies.add(transaction.companyId);

        if (!dailyData.has(date)) {
          dailyData.set(date, {
            date,
            revenue: 0,
            transactionCount: 0,
            newCustomers: 0,
          });
        }

        const data = dailyData.get(date);
        data.revenue += Number(transaction.amount);
        data.transactionCount++;

        // Check if this is a new customer (first transaction)
        if (transaction.transactionType === TransactionType.SUBSCRIPTION) {
          data.newCustomers++;
        }
      });

      // Convert to array and sort by date
      const data = Array.from(dailyData.values()).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Calculate summary
      const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
      const totalTransactions = data.reduce(
        (sum, d) => sum + d.transactionCount,
        0
      );
      const totalNewCustomers = data.reduce(
        (sum, d) => sum + d.newCustomers,
        0
      );
      const averageDailyRevenue =
        data.length > 0 ? totalRevenue / data.length : 0;

      // Calculate growth rate
      const firstHalf = data.slice(0, Math.floor(data.length / 2));
      const secondHalf = data.slice(Math.floor(data.length / 2));
      const firstHalfRevenue = firstHalf.reduce((sum, d) => sum + d.revenue, 0);
      const secondHalfRevenue = secondHalf.reduce(
        (sum, d) => sum + d.revenue,
        0
      );
      const growthRate =
        firstHalfRevenue > 0
          ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100
          : 0;

      return {
        period,
        data,
        summary: {
          totalRevenue,
          totalTransactions,
          totalNewCustomers,
          averageDailyRevenue,
          growthRate: Math.round(growthRate * 100) / 100,
        },
      };
    } catch (error) {
      logger.error("Error getting revenue trends:", error);
      throw new AppError("Failed to get revenue trends", 500);
    }
  }

  /**
   * Get top performing companies
   */
  async getTopPerformingCompanies(filters: {
    limit?: number;
    metric?: string;
  }) {
    const { limit = 10, metric = "revenue" } = filters;

    const orderBy: any = {};
    orderBy[metric === "revenue" ? "totalRevenue" : "totalTransactions"] =
      "desc";

    const companies = await prisma.financialDetails.findMany({
      take: limit,
      orderBy,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            subscriptionPlan: true,
            subscriptionStatus: true,
            createdAt: true,
          },
        },
      },
    });

    return companies.map((fd) => ({
      companyId: fd.companyId,
      companyName: fd.company.name,
      totalRevenue: Number(fd.totalRevenue),
      totalTransactions: fd.totalTransactions,
      averageTransactionValue: Number(fd.averageTransactionValue),
      monthlyRecurringRevenue: Number(fd.monthlyRecurringRevenue),
      churnRate: Number(fd.churnRate),
      customerLifetimeValue: Number(fd.customerLifetimeValue),
    }));
  }

  /**
   * Get financial health metrics
   */
  async getFinancialHealth(): Promise<FinancialHealth> {
    try {
      const analytics = await this.getFinancialAnalytics({});

      // Calculate health scores
      const revenueGrowthScore = this.calculateHealthScore(
        analytics.revenueGrowth.growthRate,
        [20, 10, 0, -10] // thresholds for excellent, good, fair, poor
      );

      const churnRateScore = this.calculateHealthScore(
        analytics.churnRate,
        [2, 5, 10, 20], // lower is better
        true
      );

      const avgTransactionScore = this.calculateHealthScore(
        analytics.averageTransactionValue,
        [1000, 500, 200, 100] // thresholds
      );

      const clvScore = this.calculateHealthScore(
        analytics.customerLifetimeValue,
        [10000, 5000, 2000, 1000] // thresholds
      );

      // Overall health
      const overallScore = Math.round(
        (revenueGrowthScore + churnRateScore + avgTransactionScore + clvScore) /
          4
      );

      let overallHealth: "excellent" | "good" | "fair" | "poor";
      if (overallScore >= 4) overallHealth = "excellent";
      else if (overallScore >= 3) overallHealth = "good";
      else if (overallScore >= 2) overallHealth = "fair";
      else overallHealth = "poor";

      // Generate recommendations
      const recommendations = this.generateRecommendations({
        revenueGrowth: analytics.revenueGrowth.growthRate,
        churnRate: analytics.churnRate,
        averageTransactionValue: analytics.averageTransactionValue,
        customerLifetimeValue: analytics.customerLifetimeValue,
      });

      return {
        overallHealth,
        metrics: {
          revenueGrowth: {
            value: analytics.revenueGrowth.growthRate,
            status: this.getHealthStatus(revenueGrowthScore),
          },
          churnRate: {
            value: analytics.churnRate,
            status: this.getHealthStatus(churnRateScore),
          },
          averageTransactionValue: {
            value: analytics.averageTransactionValue,
            status: this.getHealthStatus(avgTransactionScore),
          },
          customerLifetimeValue: {
            value: analytics.customerLifetimeValue,
            status: this.getHealthStatus(clvScore),
          },
        },
        recommendations,
      };
    } catch (error) {
      logger.error("Error getting financial health:", error);
      throw new AppError("Failed to get financial health", 500);
    }
  }

  /**
   * Update financial details for a company
   */
  async updateFinancialDetails(companyId: string, updateData: any) {
    try {
      const financialDetails = await prisma.financialDetails.upsert({
        where: { companyId },
        update: {
          ...updateData,
          lastUpdatedAt: new Date(),
        },
        create: {
          companyId,
          ...updateData,
        },
      });

      logger.info(`Financial details updated for company: ${companyId}`);
      return financialDetails;
    } catch (error) {
      logger.error("Error updating financial details:", error);
      throw new AppError("Failed to update financial details", 500);
    }
  }

  /**
   * Recalculate financial details for a company
   */
  async recalculateFinancialDetails(companyId: string) {
    try {
      // Get all transactions for the company
      const transactions = await prisma.transaction.findMany({
        where: { companyId },
      });

      const totalRevenue = transactions.reduce(
        (sum, t) => sum + Number(t.amount),
        0
      );
      const totalTransactions = transactions.length;
      const successfulTransactions = transactions.filter(
        (t) => t.status === TransactionStatus.COMPLETED
      ).length;
      const failedTransactions = transactions.filter(
        (t) => t.status === TransactionStatus.FAILED
      ).length;
      const refundedTransactions = transactions.filter(
        (t) =>
          t.status === TransactionStatus.REFUNDED ||
          t.status === TransactionStatus.PARTIALLY_REFUNDED
      ).length;

      const averageTransactionValue =
        totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

      // Calculate MRR and ARR
      const monthlyTransactions = transactions.filter(
        (t) =>
          t.status === TransactionStatus.COMPLETED &&
          t.transactionType === TransactionType.SUBSCRIPTION &&
          t.createdAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );

      const monthlyRecurringRevenue = monthlyTransactions.reduce(
        (sum, t) => sum + Number(t.amount),
        0
      );

      const annualRecurringRevenue = monthlyRecurringRevenue * 12;

      // Calculate churn rate (simplified)
      const churnRate = this.calculateChurnRate(companyId);

      // Calculate customer lifetime value (simplified)
      const customerLifetimeValue =
        this.calculateCustomerLifetimeValue(companyId);

      const financialDetails = await prisma.financialDetails.upsert({
        where: { companyId },
        update: {
          totalRevenue,
          totalTransactions,
          successfulTransactions,
          failedTransactions,
          refundedTransactions,
          averageTransactionValue,
          monthlyRecurringRevenue,
          annualRecurringRevenue,
          churnRate,
          customerLifetimeValue,
          lastUpdatedAt: new Date(),
        },
        create: {
          companyId,
          totalRevenue,
          totalTransactions,
          successfulTransactions,
          failedTransactions,
          refundedTransactions,
          averageTransactionValue,
          monthlyRecurringRevenue,
          annualRecurringRevenue,
          churnRate,
          customerLifetimeValue,
        },
      });

      logger.info(`Financial details recalculated for company: ${companyId}`);
      return financialDetails;
    } catch (error) {
      logger.error("Error recalculating financial details:", error);
      throw new AppError("Failed to recalculate financial details", 500);
    }
  }

  /**
   * Get financial dashboard data
   */
  async getFinancialDashboard(filters: {
    period?: string;
  }): Promise<FinancialDashboard> {
    try {
      const { period = "30days" } = filters;

      // Get overview data
      const analytics = await this.getFinancialAnalytics({});

      // Get recent transactions
      const recentTransactions = await prisma.transaction.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Get top companies
      const topCompanies = await this.getTopPerformingCompanies({ limit: 5 });

      // Get revenue chart data
      const revenueTrends = await this.getRevenueTrends({ period });
      const revenueChart = {
        labels: revenueTrends.data.map((d) => d.date),
        data: revenueTrends.data.map((d) => d.revenue),
      };

      return {
        overview: {
          totalRevenue: analytics.totalRevenue,
          monthlyRecurringRevenue: analytics.monthlyRecurringRevenue,
          totalCustomers: analytics.totalCompanies,
          activeCustomers: analytics.totalCompanies, // Simplified
          churnRate: analytics.churnRate,
        },
        recentTransactions,
        topCompanies: topCompanies.map((tc) => ({
          companyId: tc.companyId,
          companyName: tc.companyName,
          revenue: tc.totalRevenue,
          growth: 0, // Would need historical data to calculate
        })),
        revenueChart,
        metrics: {
          averageTransactionValue: analytics.averageTransactionValue,
          customerLifetimeValue: analytics.customerLifetimeValue,
          revenueGrowth: analytics.revenueGrowth.growthRate,
          transactionSuccessRate:
            analytics.totalTransactions > 0
              ? (analytics.successfulTransactions /
                  analytics.totalTransactions) *
                100
              : 0,
        },
      };
    } catch (error) {
      logger.error("Error getting financial dashboard:", error);
      throw new AppError("Failed to get financial dashboard", 500);
    }
  }

  /**
   * Helper methods
   */
  private calculateHealthScore(
    value: number,
    thresholds: number[],
    reverse = false
  ): number {
    if (reverse) {
      if (value <= thresholds[0]) return 4;
      if (value <= thresholds[1]) return 3;
      if (value <= thresholds[2]) return 2;
      return 1;
    } else {
      if (value >= thresholds[0]) return 4;
      if (value >= thresholds[1]) return 3;
      if (value >= thresholds[2]) return 2;
      return 1;
    }
  }

  private getHealthStatus(
    score: number
  ): "excellent" | "good" | "fair" | "poor" {
    if (score >= 4) return "excellent";
    if (score >= 3) return "good";
    if (score >= 2) return "fair";
    return "poor";
  }

  private generateRecommendations(metrics: any): string[] {
    const recommendations: string[] = [];

    if (metrics.revenueGrowth < 5) {
      recommendations.push(
        "Focus on customer acquisition and retention strategies"
      );
    }

    if (metrics.churnRate > 5) {
      recommendations.push(
        "Implement customer success programs to reduce churn"
      );
    }

    if (metrics.averageTransactionValue < 500) {
      recommendations.push(
        "Consider upselling strategies to increase transaction value"
      );
    }

    if (metrics.customerLifetimeValue < 5000) {
      recommendations.push(
        "Improve customer experience to increase lifetime value"
      );
    }

    return recommendations;
  }

  private async getPreviousPeriodRevenue(filters: any): Promise<number> {
    // Simplified implementation - would need proper date range calculation
    return 0;
  }

  private async getRevenueByMonth(filters: any): Promise<any[]> {
    // Simplified implementation - would need proper monthly aggregation
    return [];
  }

  private calculateChurnRate(companyId: string): number {
    // Simplified implementation - would need proper churn calculation
    return 0;
  }

  private calculateCustomerLifetimeValue(companyId: string): number {
    // Simplified implementation - would need proper CLV calculation
    return 0;
  }
}
