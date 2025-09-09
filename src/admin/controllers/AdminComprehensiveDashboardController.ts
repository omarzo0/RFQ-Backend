import { Request, Response } from "express";
import { AdminDashboardService } from "../services/AdminDashboardService";
import { AdminManagementService } from "../services/AdminManagementService";
import { AdminCompanyService } from "../services/AdminCompanyService";
import { AdminAnalyticsService } from "../services/AdminAnalyticsService";
import { AdminSubscriptionService } from "../services/AdminSubscriptionService";
import { AdminTicketService } from "../services/AdminTicketService";
import { successResponse, errorResponse } from "../../utils/response";
import { AppError } from "../../utils/errors";
import logger from "../../utils/logger";

export class AdminComprehensiveDashboardController {
  private adminDashboardService: AdminDashboardService;
  private adminManagementService: AdminManagementService;
  private adminCompanyService: AdminCompanyService;
  private adminAnalyticsService: AdminAnalyticsService;
  private adminSubscriptionService: AdminSubscriptionService;
  private adminTicketService: AdminTicketService;

  constructor() {
    this.adminDashboardService = new AdminDashboardService();
    this.adminManagementService = new AdminManagementService();
    this.adminCompanyService = new AdminCompanyService();
    this.adminAnalyticsService = new AdminAnalyticsService();
    this.adminSubscriptionService = new AdminSubscriptionService();
    this.adminTicketService = new AdminTicketService();
  }

  /**
   * Get comprehensive admin dashboard data
   * GET /api/v1/admin/dashboard/comprehensive
   */
  getComprehensiveDashboard = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const [dashboardData, adminStats] = await Promise.all([
        this.adminDashboardService.getDashboardData(),
        this.adminManagementService.getAdminStatistics(),
        // this.adminTicketService.getTicketStatistics(),
      ]);

      const comprehensiveData = {
        ...dashboardData,
        adminStats,
        // ticketStats,
        // featureStats,
        systemHealth: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          nodeVersion: process.version,
          platform: process.platform,
        },
      };

      successResponse(
        res,
        comprehensiveData,
        "Comprehensive dashboard data retrieved successfully"
      );
    } catch (error) {
      logger.error("Get comprehensive dashboard error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get admin management overview
   * GET /api/v1/admin/dashboard/admin-management
   */
  getAdminManagementOverview = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { page = 1, limit = 10, search, role, isActive } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        role: role ? (role as any) : undefined,
        isActive:
          isActive === "true" ? true : isActive === "false" ? false : undefined,
      };

      const [adminsData, adminStats] = await Promise.all([
        this.adminManagementService.getAdmins(filters),
        this.adminManagementService.getAdminStatistics(),
      ]);

      const overview = {
        ...adminsData,
        statistics: adminStats,
      };

      successResponse(
        res,
        overview,
        "Admin management overview retrieved successfully"
      );
    } catch (error) {
      logger.error("Get admin management overview error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get company management overview
   * GET /api/v1/admin/dashboard/company-management
   */
  getCompanyManagementOverview = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { page = 1, limit = 10, search, status, plan } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        status: status as string,
        plan: plan as string,
      };

      const [companiesData, subscriptionStats] = await Promise.all([
        this.adminCompanyService.getCompanies(
          filters.page,
          filters.limit,
          filters.search,
          filters.status
        ),
        this.adminSubscriptionService.getSubscriptionAnalytics(),
      ]);

      const overview = {
        ...companiesData,
        subscriptionStats,
      };

      successResponse(
        res,
        overview,
        "Company management overview retrieved successfully"
      );
    } catch (error) {
      logger.error("Get company management overview error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get ticket management overview
   * GET /api/v1/admin/dashboard/ticket-management
   */
  getTicketManagementOverview = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        priority,
        category,
        assignedTo,
      } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
        priority: priority as string,
        category: category as string,
        assignedTo: assignedTo as string,
      };

      const [ticketsData, ticketStats] = await Promise.all([
        this.adminTicketService.getTickets(filters),
        this.adminTicketService.getTicketStatistics(),
      ]);

      const overview = {
        ...ticketsData,
        statistics: ticketStats,
      };

      successResponse(
        res,
        overview,
        "Ticket management overview retrieved successfully"
      );
    } catch (error) {
      logger.error("Get ticket management overview error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get system features overview
   * GET /api/v1/admin/dashboard/system-features
   */
  getSystemFeaturesOverview = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { page = 1, limit = 20, category, isActive, isPremium } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        category: category as string,
        isActive:
          isActive === "true" ? true : isActive === "false" ? false : undefined,
        isPremium:
          isPremium === "true"
            ? true
            : isPremium === "false"
            ? false
            : undefined,
      };

      const overview = {
        features: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };

      successResponse(
        res,
        overview,
        "System features overview retrieved successfully"
      );
    } catch (error) {
      logger.error("Get system features overview error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get analytics overview
   * GET /api/v1/admin/dashboard/analytics
   */
  getAnalyticsOverview = async (req: Request, res: Response): Promise<void> => {
    try {
      const { months = 12, days = 30 } = req.query;

      const [
        companyGrowth,
        revenueData,
        userActivity,
        emailPerformance,
        rfqPerformance,
        quotePerformance,
        topCompanies,
        systemHealth,
      ] = await Promise.all([
        this.adminAnalyticsService.getCompanyGrowthData(
          parseInt(months as string)
        ),
        this.adminAnalyticsService.getRevenueData(parseInt(months as string)),
        this.adminAnalyticsService.getUserActivityData(
          parseInt(days as string)
        ),
        this.adminAnalyticsService.getEmailPerformanceData(
          parseInt(days as string)
        ),
        this.adminAnalyticsService.getRFQPerformanceData(
          parseInt(days as string)
        ),
        this.adminAnalyticsService.getQuotePerformanceData(
          parseInt(days as string)
        ),
        this.adminAnalyticsService.getTopPerformingCompanies(10),
        this.adminAnalyticsService.getSystemHealthMetrics(),
      ]);

      const analytics = {
        companyGrowth,
        revenueData,
        userActivity,
        emailPerformance,
        rfqPerformance,
        quotePerformance,
        topCompanies,
        systemHealth,
      };

      successResponse(
        res,
        analytics,
        "Analytics overview retrieved successfully"
      );
    } catch (error) {
      logger.error("Get analytics overview error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get subscription overview
   * GET /api/v1/admin/dashboard/subscriptions
   */
  getSubscriptionOverview = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { page = 1, limit = 20, status, plan, search } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
        plan: plan as string,
        search: search as string,
      };

      const [subscriptionsData, subscriptionStats, expiringTrials] =
        await Promise.all([
          this.adminSubscriptionService.getSubscriptions(filters),
          this.adminSubscriptionService.getSubscriptionAnalytics(),
          this.adminSubscriptionService.getExpiringTrials(7),
        ]);

      const overview = {
        ...subscriptionsData,
        statistics: subscriptionStats,
        expiringTrials,
      };

      successResponse(
        res,
        overview,
        "Subscription overview retrieved successfully"
      );
    } catch (error) {
      logger.error("Get subscription overview error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get recent activity across all modules
   * GET /api/v1/admin/dashboard/recent-activity
   */
  getRecentActivity = async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit = 50 } = req.query;

      const [recentTickets, recentCompanies, recentAdmins] = await Promise.all([
        this.adminTicketService.getRecentTickets(parseInt(limit as string) / 4),
        this.adminCompanyService.getCompanies(1, parseInt(limit as string) / 4),
        this.adminManagementService.getAdmins({
          page: 1,
          limit: parseInt(limit as string) / 4,
        }),
      ]);

      const activities = [
        ...recentTickets.map((ticket) => ({
          id: ticket.id,
          type: "TICKET",
          title: ticket.title,
          description: `New ticket: ${ticket.title}`,
          timestamp: ticket.createdAt,
          priority: ticket.priority,
          status: ticket.status,
        })),
        ...recentCompanies.companies.map((company) => ({
          id: company.id,
          type: "COMPANY",
          title: company.name,
          description: `Company ${
            company.isActive ? "activated" : "deactivated"
          }: ${company.name}`,
          timestamp: company.updatedAt,
          status: company.isActive ? "ACTIVE" : "INACTIVE",
        })),
        ...recentAdmins.admins.map((admin) => ({
          id: admin.id,
          type: "ADMIN",
          title: `${admin.firstName} ${admin.lastName}`,
          description: `Admin ${
            admin.isActive ? "activated" : "deactivated"
          }: ${admin.email}`,
          timestamp: admin.updatedAt,
          status: admin.isActive ? "ACTIVE" : "INACTIVE",
        })),
      ]
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, parseInt(limit as string));

      successResponse(
        res,
        activities,
        "Recent activity retrieved successfully"
      );
    } catch (error) {
      logger.error("Get recent activity error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get system health and performance metrics
   * GET /api/v1/admin/dashboard/system-health
   */
  getSystemHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const [systemHealth, adminStats] = await Promise.all([
        this.adminAnalyticsService.getSystemHealthMetrics(),
        this.adminManagementService.getAdminStatistics(),
        // this.adminTicketService.getTicketStatistics(),
      ]);

      const health = {
        ...systemHealth,
        adminStats,
        // ticketStats,
        // featureStats,
        serverInfo: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
        },
        timestamp: new Date(),
      };

      successResponse(res, health, "System health retrieved successfully");
    } catch (error) {
      logger.error("Get system health error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };
}
