import { Request, Response } from "express";
import { AdminFinancialService } from "../services/AdminFinancialService";
import { successResponse, errorResponse } from "../../utils/response";
import { AppError } from "../../utils/errors";
import logger from "../../utils/logger";

export class AdminFinancialController {
  private adminFinancialService: AdminFinancialService;

  constructor() {
    this.adminFinancialService = new AdminFinancialService();
  }

  /**
   * Get all financial details with filtering and pagination
   * GET /api/v1/admin/financial
   */
  getFinancialDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 20,
        companyId,
        sortBy = "totalRevenue",
        sortOrder = "desc",
      } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        companyId: companyId as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
      };

      const financialData =
        await this.adminFinancialService.getFinancialDetails(filters);

      successResponse(
        res,
        financialData,
        "Financial details retrieved successfully",
        200
      );
    } catch (error) {
      logger.error("Get financial details error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get financial details by company ID
   * GET /api/v1/admin/financial/company/:companyId
   */
  getFinancialDetailsByCompany = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { companyId } = req.params;

      if (!companyId) {
        errorResponse(res, "Company ID is required", 400);
        return;
      }

      const financialDetails =
        await this.adminFinancialService.getFinancialDetailsByCompany(
          companyId
        );

      successResponse(
        res,
        financialDetails,
        "Company financial details retrieved successfully",
        200
      );
    } catch (error) {
      logger.error("Get company financial details error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get financial analytics and overview
   * GET /api/v1/admin/financial/analytics
   */
  getFinancialAnalytics = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { dateFrom, dateTo, companyId } = req.query;

      const analytics = await this.adminFinancialService.getFinancialAnalytics({
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
        companyId: companyId as string,
      });

      successResponse(
        res,
        analytics,
        "Financial analytics retrieved successfully",
        200
      );
    } catch (error) {
      logger.error("Get financial analytics error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get revenue trends
   * GET /api/v1/admin/financial/revenue-trends
   */
  getRevenueTrends = async (req: Request, res: Response): Promise<void> => {
    try {
      const { period = "12months", companyId } = req.query;

      const trends = await this.adminFinancialService.getRevenueTrends({
        period: period as string,
        companyId: companyId as string,
      });

      successResponse(
        res,
        trends,
        "Revenue trends retrieved successfully",
        200
      );
    } catch (error) {
      logger.error("Get revenue trends error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get top performing companies
   * GET /api/v1/admin/financial/top-companies
   */
  getTopPerformingCompanies = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { limit = 10, metric = "revenue" } = req.query;

      const topCompanies =
        await this.adminFinancialService.getTopPerformingCompanies({
          limit: parseInt(limit as string),
          metric: metric as string,
        });

      successResponse(
        res,
        topCompanies,
        "Top performing companies retrieved successfully",
        200
      );
    } catch (error) {
      logger.error("Get top performing companies error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get financial health metrics
   * GET /api/v1/admin/financial/health
   */
  getFinancialHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const healthMetrics =
        await this.adminFinancialService.getFinancialHealth();

      successResponse(
        res,
        healthMetrics,
        "Financial health metrics retrieved successfully",
        200
      );
    } catch (error) {
      logger.error("Get financial health error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Update financial details for a company
   * PUT /api/v1/admin/financial/company/:companyId
   */
  updateFinancialDetails = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { companyId } = req.params;
      const updateData = req.body;

      if (!companyId) {
        errorResponse(res, "Company ID is required", 400);
        return;
      }

      const financialDetails =
        await this.adminFinancialService.updateFinancialDetails(
          companyId,
          updateData
        );

      successResponse(
        res,
        financialDetails,
        "Financial details updated successfully",
        200
      );
    } catch (error) {
      logger.error("Update financial details error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Recalculate financial details for a company
   * POST /api/v1/admin/financial/company/:companyId/recalculate
   */
  recalculateFinancialDetails = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { companyId } = req.params;

      if (!companyId) {
        errorResponse(res, "Company ID is required", 400);
        return;
      }

      const financialDetails =
        await this.adminFinancialService.recalculateFinancialDetails(companyId);

      successResponse(
        res,
        financialDetails,
        "Financial details recalculated successfully",
        200
      );
    } catch (error) {
      logger.error("Recalculate financial details error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get financial dashboard data
   * GET /api/v1/admin/financial/dashboard
   */
  getFinancialDashboard = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { period = "30days" } = req.query;

      const dashboardData =
        await this.adminFinancialService.getFinancialDashboard({
          period: period as string,
        });

      successResponse(
        res,
        dashboardData,
        "Financial dashboard data retrieved successfully",
        200
      );
    } catch (error) {
      logger.error("Get financial dashboard error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };
}
