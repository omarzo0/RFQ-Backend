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

export class AdminDashboardController {
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

  // ─── Dashboard Overview ──────────────────────────────────────────────

  /**
   * Get comprehensive dashboard data
   * GET /api/v1/admin/dashboard
   */
  getDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const dashboardData = await this.adminDashboardService.getDashboardData();

      successResponse(
        res,
        dashboardData,
        "Dashboard data retrieved successfully"
      );
    } catch (error) {
      logger.error("Get dashboard error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

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
      ]);

      const comprehensiveData = {
        ...dashboardData,
        adminStats,
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

  // ─── Company & Data Management ───────────────────────────────────────

  /**
   * Get detailed company data
   * GET /api/v1/admin/dashboard/companies/:companyId/details
   */
  getCompanyDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { companyId } = req.params;

      if (!companyId) {
        errorResponse(res, "Company ID is required", 400);
        return;
      }

      const companyDetails = await this.adminDashboardService.getCompanyDetails(
        companyId
      );

      successResponse(
        res,
        companyDetails,
        "Company details retrieved successfully"
      );
    } catch (error) {
      logger.error("Get company details error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get all RFQs across all companies
   * GET /api/v1/admin/dashboard/rfqs
   */
  getAllRFQs = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 20, status, companyId, search } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
        companyId: companyId as string,
        search: search as string,
      };

      const rfqsData = await this.adminDashboardService.getAllRFQs(filters);

      successResponse(res, rfqsData, "RFQs retrieved successfully");
    } catch (error) {
      logger.error("Get all RFQs error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get all quotes across all companies
   * GET /api/v1/admin/dashboard/quotes
   */
  getAllQuotes = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 20, status, companyId, search } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
        companyId: companyId as string,
        search: search as string,
      };

      const quotesData = await this.adminDashboardService.getAllQuotes(filters);

      successResponse(res, quotesData, "Quotes retrieved successfully");
    } catch (error) {
      logger.error("Get all quotes error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get all contacts across all companies
   * GET /api/v1/admin/dashboard/contacts
   */
  getAllContacts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 20, companyId, search } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        companyId: companyId as string,
        search: search as string,
      };

      const contactsData = await this.adminDashboardService.getAllContacts(
        filters
      );

      successResponse(res, contactsData, "Contacts retrieved successfully");
    } catch (error) {
      logger.error("Get all contacts error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get all shipping lines across all companies
   * GET /api/v1/admin/dashboard/shipping-lines
   */
  getAllShippingLines = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 20, companyId, search } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        companyId: companyId as string,
        search: search as string,
      };

      const shippingLinesData =
        await this.adminDashboardService.getAllShippingLines(filters);

      successResponse(
        res,
        shippingLinesData,
        "Shipping lines retrieved successfully"
      );
    } catch (error) {
      logger.error("Get all shipping lines error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get all email logs across all companies
   * GET /api/v1/admin/dashboard/emails
   */
  getAllEmailLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 20, companyId, status, search } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        companyId: companyId as string,
        status: status as string,
        search: search as string,
      };

      const emailLogsData = await this.adminDashboardService.getAllEmailLogs(
        filters
      );

      successResponse(res, emailLogsData, "Email logs retrieved successfully");
    } catch (error) {
      logger.error("Get all email logs error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  // ─── Management Overviews ────────────────────────────────────────────

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

  // ─── Subscriptions ───────────────────────────────────────────────────

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

  // ─── Analytics ───────────────────────────────────────────────────────

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
   * Get subscription analytics
   * GET /api/v1/admin/dashboard/analytics/subscriptions
   */
  getSubscriptionAnalytics = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const dashboardData = await this.adminDashboardService.getDashboardData();

      successResponse(
        res,
        dashboardData.subscriptionStats,
        "Subscription analytics retrieved successfully"
      );
    } catch (error) {
      logger.error("Get subscription analytics error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get email analytics
   * GET /api/v1/admin/dashboard/analytics/emails
   */
  getEmailAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const dashboardData = await this.adminDashboardService.getDashboardData();

      successResponse(
        res,
        dashboardData.emailStats,
        "Email analytics retrieved successfully"
      );
    } catch (error) {
      logger.error("Get email analytics error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get RFQ analytics
   * GET /api/v1/admin/dashboard/analytics/rfqs
   */
  getRFQAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const dashboardData = await this.adminDashboardService.getDashboardData();

      successResponse(
        res,
        dashboardData.rfqStats,
        "RFQ analytics retrieved successfully"
      );
    } catch (error) {
      logger.error("Get RFQ analytics error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get quote analytics
   * GET /api/v1/admin/dashboard/analytics/quotes
   */
  getQuoteAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const dashboardData = await this.adminDashboardService.getDashboardData();

      successResponse(
        res,
        dashboardData.quoteStats,
        "Quote analytics retrieved successfully"
      );
    } catch (error) {
      logger.error("Get quote analytics error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get company growth data
   * GET /api/v1/admin/analytics/company-growth
   */
  getCompanyGrowth = async (req: Request, res: Response): Promise<void> => {
    try {
      const { months = 12 } = req.query;
      const monthsNumber = parseInt(months as string);

      const growthData = await this.adminAnalyticsService.getCompanyGrowthData(
        monthsNumber
      );

      successResponse(
        res,
        growthData,
        "Company growth data retrieved successfully",
        200
      );
    } catch (error) {
      logger.error("Get company growth error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get revenue data
   * GET /api/v1/admin/analytics/revenue
   */
  getRevenue = async (req: Request, res: Response): Promise<void> => {
    try {
      const { months = 12 } = req.query;
      const monthsNumber = parseInt(months as string);

      const revenueData = await this.adminAnalyticsService.getRevenueData(
        monthsNumber
      );

      successResponse(
        res,
        revenueData,
        "Revenue data retrieved successfully",
        200
      );
    } catch (error) {
      logger.error("Get revenue error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get user activity data
   * GET /api/v1/admin/analytics/user-activity
   */
  getUserActivity = async (req: Request, res: Response): Promise<void> => {
    try {
      const { days = 30 } = req.query;
      const daysNumber = parseInt(days as string);

      const activityData = await this.adminAnalyticsService.getUserActivityData(
        daysNumber
      );

      successResponse(
        res,
        activityData,
        "User activity data retrieved successfully",
        200
      );
    } catch (error) {
      logger.error("Get user activity error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get email performance data
   * GET /api/v1/admin/analytics/email-performance
   */
  getEmailPerformance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { days = 30 } = req.query;
      const daysNumber = parseInt(days as string);

      const performanceData =
        await this.adminAnalyticsService.getEmailPerformanceData(daysNumber);

      successResponse(
        res,
        performanceData,
        "Email performance data retrieved successfully",
        200
      );
    } catch (error) {
      logger.error("Get email performance error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get RFQ performance data
   * GET /api/v1/admin/analytics/rfq-performance
   */
  getRFQPerformance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { days = 30 } = req.query;
      const daysNumber = parseInt(days as string);

      const performanceData =
        await this.adminAnalyticsService.getRFQPerformanceData(daysNumber);

      successResponse(
        res,
        performanceData,
        "RFQ performance data retrieved successfully",
        200
      );
    } catch (error) {
      logger.error("Get RFQ performance error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get quote performance data
   * GET /api/v1/admin/analytics/quote-performance
   */
  getQuotePerformance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { days = 30 } = req.query;
      const daysNumber = parseInt(days as string);

      const performanceData =
        await this.adminAnalyticsService.getQuotePerformanceData(daysNumber);

      successResponse(
        res,
        performanceData,
        "Quote performance data retrieved successfully",
        200
      );
    } catch (error) {
      logger.error("Get quote performance error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get top performing companies
   * GET /api/v1/admin/analytics/top-companies
   */
  getTopCompanies = async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit = 10 } = req.query;
      const limitNumber = parseInt(limit as string);

      const topCompanies =
        await this.adminAnalyticsService.getTopPerformingCompanies(limitNumber);

      successResponse(
        res,
        topCompanies,
        "Top performing companies retrieved successfully",
        200
      );
    } catch (error) {
      logger.error("Get top companies error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  // ─── System Health & Activity ────────────────────────────────────────

  /**
   * Get system health metrics
   * GET /api/v1/admin/analytics/system-health
   * GET /api/v1/admin/dashboard/system-health
   */
  getSystemHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const [systemHealth, adminStats] = await Promise.all([
        this.adminAnalyticsService.getSystemHealthMetrics(),
        this.adminManagementService.getAdminStatistics(),
      ]);

      const health = {
        ...systemHealth,
        adminStats,
        serverInfo: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
        },
        timestamp: new Date(),
      };

      successResponse(res, health, "System health metrics retrieved successfully");
    } catch (error) {
      logger.error("Get system health error:", error);

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
}
