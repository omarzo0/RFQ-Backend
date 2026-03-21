import { prisma } from "../../app";
import { AppError } from "../../utils/errors";
import logger from "../../utils/logger";
import { CacheService } from "../../services/CacheService";

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface CompanyGrowthData {
  month: string;
  newCompanies: number;
  activeCompanies: number;
  totalCompanies: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  subscriptions: number;
  churn: number;
}

export interface UserActivityData {
  date: string;
  activeUsers: number;
  newUsers: number;
  totalUsers: number;
}

export interface EmailPerformanceData {
  date: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
}

export interface RFQPerformanceData {
  date: string;
  created: number;
  sent: number;
  responded: number;
  averageResponseTime: number;
}

export interface QuotePerformanceData {
  date: string;
  created: number;
  accepted: number;
  rejected: number;
  averageValue: number;
}

export class AdminAnalyticsService {
  /**
   * Get company growth data over time
   */
  async getCompanyGrowthData(
    months: number = 12
  ): Promise<CompanyGrowthData[]> {
    return CacheService.getOrSet(
      `analytics:company-growth:${months}`,
      async () => {
        try {
          const startDate = new Date();
          startDate.setMonth(startDate.getMonth() - months);

          const companies = await prisma.company.findMany({
            where: {
              createdAt: {
                gte: startDate,
              },
            },
            select: {
              createdAt: true,
              isActive: true,
            },
            orderBy: { createdAt: "asc" },
          });

          const monthlyData: { [key: string]: CompanyGrowthData } = {};

          for (let i = 0; i < months; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}`;

            monthlyData[monthKey] = {
              month: monthKey,
              newCompanies: 0,
              activeCompanies: 0,
              totalCompanies: 0,
            };
          }

          companies.forEach((company) => {
            const monthKey = `${company.createdAt.getFullYear()}-${String(
              company.createdAt.getMonth() + 1
            ).padStart(2, "0")}`;

            if (monthlyData[monthKey]) {
              monthlyData[monthKey].newCompanies++;
              if (company.isActive) {
                monthlyData[monthKey].activeCompanies++;
              }
            }
          });

          const sortedMonths = Object.keys(monthlyData).sort();
          let cumulativeTotal = 0;

          sortedMonths.forEach((month) => {
            cumulativeTotal += monthlyData[month].newCompanies;
            monthlyData[month].totalCompanies = cumulativeTotal;
          });

          return sortedMonths.map((month) => monthlyData[month]);
        } catch (error) {
          logger.error("Error getting company growth data:", error);
          throw new AppError("Failed to get company growth data", 500);
        }
      },
      600 // 10 minutes
    );
  }

  /**
   * Get revenue data over time
   */
  async getRevenueData(months: number = 12): Promise<RevenueData[]> {
    return CacheService.getOrSet(
      `analytics:revenue:${months}`,
      async () => {
        try {
          const startDate = new Date();
          startDate.setMonth(startDate.getMonth() - months);

          const companies = await prisma.company.findMany({
            where: {
              createdAt: {
                gte: startDate,
              },
            },
            select: {
              createdAt: true,
              subscriptionStatus: true,
              subscriptionPlan: true,
            },
            orderBy: { createdAt: "asc" },
          });

          const monthlyData: { [key: string]: RevenueData } = {};

          for (let i = 0; i < months; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}`;

            monthlyData[monthKey] = {
              month: monthKey,
              revenue: 0,
              subscriptions: 0,
              churn: 0,
            };
          }

          const planPrices: { [key: string]: number } = {
            trial: 0,
            basic: 99,
            professional: 299,
            enterprise: 999,
          };

          companies.forEach((company) => {
            const monthKey = `${company.createdAt.getFullYear()}-${String(
              company.createdAt.getMonth() + 1
            ).padStart(2, "0")}`;

            if (monthlyData[monthKey]) {
              monthlyData[monthKey].subscriptions++;
              monthlyData[monthKey].revenue +=
                planPrices[company.subscriptionPlan] || 0;
            }
          });

          return Object.keys(monthlyData)
            .sort()
            .map((month) => monthlyData[month]);
        } catch (error) {
          logger.error("Error getting revenue data:", error);
          throw new AppError("Failed to get revenue data", 500);
        }
      },
      600 // 10 minutes
    );
  }

  /**
   * Get user activity data over time
   */
  async getUserActivityData(days: number = 30): Promise<UserActivityData[]> {
    return CacheService.getOrSet(
      `analytics:user-activity:${days}`,
      async () => {
        try {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - days);

          const users = await prisma.companyUser.findMany({
            where: {
              createdAt: {
                gte: startDate,
              },
            },
            select: {
              createdAt: true,
              lastLoginAt: true,
            },
            orderBy: { createdAt: "asc" },
          });

          const dailyData: { [key: string]: UserActivityData } = {};

          for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayKey = date.toISOString().split("T")[0];

            dailyData[dayKey] = {
              date: dayKey,
              activeUsers: 0,
              newUsers: 0,
              totalUsers: 0,
            };
          }

          users.forEach((user) => {
            const dayKey = user.createdAt.toISOString().split("T")[0];

            if (dailyData[dayKey]) {
              dailyData[dayKey].newUsers++;
            }

            if (user.lastLoginAt) {
              const loginDayKey = user.lastLoginAt.toISOString().split("T")[0];
              if (dailyData[loginDayKey]) {
                dailyData[loginDayKey].activeUsers++;
              }
            }
          });

          const sortedDays = Object.keys(dailyData).sort();
          let cumulativeTotal = 0;

          sortedDays.forEach((day) => {
            cumulativeTotal += dailyData[day].newUsers;
            dailyData[day].totalUsers = cumulativeTotal;
          });

          return sortedDays.map((day) => dailyData[day]);
        } catch (error) {
          logger.error("Error getting user activity data:", error);
          throw new AppError("Failed to get user activity data", 500);
        }
      },
      300 // 5 minutes
    );
  }

  /**
   * Get email performance data over time
   */
  async getEmailPerformanceData(
    days: number = 30
  ): Promise<EmailPerformanceData[]> {
    return CacheService.getOrSet(
      `analytics:email-perf:${days}`,
      async () => {
        try {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - days);

          const emails = await prisma.emailLog.findMany({
            where: {
              sentAt: {
                gte: startDate,
              },
            },
            select: {
              sentAt: true,
              status: true,
            },
            orderBy: { sentAt: "asc" },
          });

          const dailyData: { [key: string]: EmailPerformanceData } = {};

          for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayKey = date.toISOString().split("T")[0];

            dailyData[dayKey] = {
              date: dayKey,
              sent: 0,
              delivered: 0,
              opened: 0,
              clicked: 0,
              bounced: 0,
            };
          }

          emails.forEach((email) => {
            if (!email.sentAt) return;
            const dayKey = email.sentAt.toISOString().split("T")[0];

            if (dailyData[dayKey]) {
              dailyData[dayKey].sent++;

              switch (email.status) {
                case "DELIVERED":
                  dailyData[dayKey].delivered++;
                  break;
                case "OPENED":
                  dailyData[dayKey].opened++;
                  break;
                case "CLICKED":
                  dailyData[dayKey].clicked++;
                  break;
                case "BOUNCED":
                  dailyData[dayKey].bounced++;
                  break;
              }
            }
          });

          return Object.keys(dailyData)
            .sort()
            .map((day) => dailyData[day]);
        } catch (error) {
          logger.error("Error getting email performance data:", error);
          throw new AppError("Failed to get email performance data", 500);
        }
      },
      300 // 5 minutes
    );
  }

  /**
   * Get RFQ performance data over time
   */
  async getRFQPerformanceData(
    days: number = 30
  ): Promise<RFQPerformanceData[]> {
    return CacheService.getOrSet(
      `analytics:rfq-perf:${days}`,
      async () => {
        try {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - days);

          const rfqs = await prisma.rFQ.findMany({
            where: {
              createdAt: {
                gte: startDate,
              },
            },
            select: {
              createdAt: true,
              sentAt: true,
              status: true,
            },
            orderBy: { createdAt: "asc" },
          });

          const dailyData: { [key: string]: RFQPerformanceData } = {};

          for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayKey = date.toISOString().split("T")[0];

            dailyData[dayKey] = {
              date: dayKey,
              created: 0,
              sent: 0,
              responded: 0,
              averageResponseTime: 0,
            };
          }

          rfqs.forEach((rfq) => {
            const dayKey = rfq.createdAt.toISOString().split("T")[0];

            if (dailyData[dayKey]) {
              dailyData[dayKey].created++;

              if (rfq.sentAt) {
                dailyData[dayKey].sent++;
              }
            }
          });

          Object.keys(dailyData).forEach((day) => {
            dailyData[day].averageResponseTime = 0;
          });

          return Object.keys(dailyData)
            .sort()
            .map((day) => dailyData[day]);
        } catch (error) {
          logger.error("Error getting RFQ performance data:", error);
          throw new AppError("Failed to get RFQ performance data", 500);
        }
      },
      300 // 5 minutes
    );
  }

  /**
   * Get quote performance data over time
   */
  async getQuotePerformanceData(
    days: number = 30
  ): Promise<QuotePerformanceData[]> {
    return CacheService.getOrSet(
      `analytics:quote-perf:${days}`,
      async () => {
        try {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - days);

          const quotes = await prisma.quote.findMany({
            where: {
              createdAt: {
                gte: startDate,
              },
            },
            select: {
              createdAt: true,
              status: true,
              totalAmount: true,
            },
            orderBy: { createdAt: "asc" },
          });

          const dailyData: { [key: string]: QuotePerformanceData } = {};

          for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayKey = date.toISOString().split("T")[0];

            dailyData[dayKey] = {
              date: dayKey,
              created: 0,
              accepted: 0,
              rejected: 0,
              averageValue: 0,
            };
          }

          quotes.forEach((quote) => {
            const dayKey = quote.createdAt.toISOString().split("T")[0];

            if (dailyData[dayKey]) {
              dailyData[dayKey].created++;

              switch (quote.status) {
                case "AWARDED":
                  dailyData[dayKey].accepted++;
                  break;
                case "WITHDRAWN":
                  dailyData[dayKey].rejected++;
                  break;
              }
            }
          });

          Object.keys(dailyData).forEach((day) => {
            const dayQuotes = quotes.filter((quote) => {
              const dayKey = quote.createdAt.toISOString().split("T")[0];
              return dayKey === day;
            });

            if (dayQuotes.length > 0) {
              const totalValue = dayQuotes.reduce((sum, quote) => {
                return sum + Number(quote.totalAmount);
              }, 0);

              dailyData[day].averageValue = totalValue / dayQuotes.length;
            }
          });

          return Object.keys(dailyData)
            .sort()
            .map((day) => dailyData[day]);
        } catch (error) {
          logger.error("Error getting quote performance data:", error);
          throw new AppError("Failed to get quote performance data", 500);
        }
      },
      300 // 5 minutes
    );
  }

  /**
   * Get top performing companies
   */
  async getTopPerformingCompanies(limit: number = 10) {
    return CacheService.getOrSet(
      `analytics:top-companies:${limit}`,
      async () => {
        try {
          const companies = await prisma.company.findMany({
            select: {
              id: true,
              name: true,
              email: true,
              subscriptionPlan: true,
              subscriptionStatus: true,
              createdAt: true,
              _count: {
                select: {
                  users: true,
                  rfqs: true,
                  emailLogs: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
            take: limit,
          });

          return companies.map((company) => ({
            id: company.id,
            name: company.name,
            email: company.email,
            subscriptionPlan: company.subscriptionPlan,
            subscriptionStatus: company.subscriptionStatus,
            userCount: company._count.users,
            rfqCount: company._count.rfqs,
            emailCount: company._count.emailLogs,
            createdAt: company.createdAt,
          }));
        } catch (error) {
          logger.error("Error getting top performing companies:", error);
          throw new AppError("Failed to get top performing companies", 500);
        }
      },
      300 // 5 minutes
    );
  }

  /**
   * Get system health metrics
   */
  async getSystemHealthMetrics() {
    return CacheService.getOrSet(
      "analytics:system-health",
      async () => {
        try {
          const [
            totalCompanies,
            activeCompanies,
            totalUsers,
            activeUsers,
            totalRFQs,
            totalQuotes,
            totalEmails,
            recentErrors,
          ] = await Promise.all([
            prisma.company.count(),
            prisma.company.count({ where: { isActive: true } }),
            prisma.companyUser.count(),
            prisma.companyUser.count({
              where: {
                lastLoginAt: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
              },
            }),
            prisma.rFQ.count(),
            prisma.quote.count(),
            prisma.emailLog.count(),
            0,
          ]);

          return {
            companies: {
              total: totalCompanies,
              active: activeCompanies,
              inactive: totalCompanies - activeCompanies,
            },
            users: {
              total: totalUsers,
              active: activeUsers,
              inactive: totalUsers - activeUsers,
            },
            content: {
              rfqs: totalRFQs,
              quotes: totalQuotes,
              emails: totalEmails,
            },
            system: {
              recentErrors,
              uptime: process.uptime(),
              memoryUsage: process.memoryUsage(),
            },
          };
        } catch (error) {
          logger.error("Error getting system health metrics:", error);
          throw new AppError("Failed to get system health metrics", 500);
        }
      },
      60 // 1 minute
    );
  }
}
