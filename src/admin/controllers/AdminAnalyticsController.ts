import { Request, Response } from "express";
import { AdminAnalyticsService } from "../services/AdminAnalyticsService";
import { successResponse, errorResponse } from "../../utils/response";
import { AppError } from "../../utils/errors";
import logger from "../../utils/logger";

export class AdminAnalyticsController {
  private adminAnalyticsService: AdminAnalyticsService;

  constructor() {
    this.adminAnalyticsService = new AdminAnalyticsService();
  }

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

      res
        .status(200)
        .json(
          successResponse(
            growthData,
            "Company growth data retrieved successfully"
          )
        );
    } catch (error) {
      logger.error("Get company growth error:", error);

      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(errorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(errorResponse("Internal server error", 500));
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

      res
        .status(200)
        .json(
          successResponse(revenueData, "Revenue data retrieved successfully")
        );
    } catch (error) {
      logger.error("Get revenue error:", error);

      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(errorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(errorResponse("Internal server error", 500));
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

      res
        .status(200)
        .json(
          successResponse(
            activityData,
            "User activity data retrieved successfully"
          )
        );
    } catch (error) {
      logger.error("Get user activity error:", error);

      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(errorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(errorResponse("Internal server error", 500));
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

      res
        .status(200)
        .json(
          successResponse(
            performanceData,
            "Email performance data retrieved successfully"
          )
        );
    } catch (error) {
      logger.error("Get email performance error:", error);

      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(errorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(errorResponse("Internal server error", 500));
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

      res
        .status(200)
        .json(
          successResponse(
            performanceData,
            "RFQ performance data retrieved successfully"
          )
        );
    } catch (error) {
      logger.error("Get RFQ performance error:", error);

      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(errorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(errorResponse("Internal server error", 500));
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

      res
        .status(200)
        .json(
          successResponse(
            performanceData,
            "Quote performance data retrieved successfully"
          )
        );
    } catch (error) {
      logger.error("Get quote performance error:", error);

      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(errorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(errorResponse("Internal server error", 500));
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

      res
        .status(200)
        .json(
          successResponse(
            topCompanies,
            "Top performing companies retrieved successfully"
          )
        );
    } catch (error) {
      logger.error("Get top companies error:", error);

      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(errorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(errorResponse("Internal server error", 500));
      }
    }
  };

  /**
   * Get system health metrics
   * GET /api/v1/admin/analytics/system-health
   */
  getSystemHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const healthMetrics =
        await this.adminAnalyticsService.getSystemHealthMetrics();

      res
        .status(200)
        .json(
          successResponse(
            healthMetrics,
            "System health metrics retrieved successfully"
          )
        );
    } catch (error) {
      logger.error("Get system health error:", error);

      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(errorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(errorResponse("Internal server error", 500));
      }
    }
  };
}
