import { Request, Response } from "express";
import { AdminDashboardService } from "../services/AdminDashboardService";
import { successResponse, errorResponse } from "../../utils/response";
import { AppError } from "../../utils/errors";
import logger from "../../utils/logger";

export class AdminDashboardController {
  private adminDashboardService: AdminDashboardService;

  constructor() {
    this.adminDashboardService = new AdminDashboardService();
  }

  /**
   * Get comprehensive dashboard data
   * GET /api/v1/admin/dashboard
   */
  getDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const dashboardData = await this.adminDashboardService.getDashboardData();

      res
        .status(200)
        .json(
          successResponse(
            dashboardData,
            "Dashboard data retrieved successfully"
          )
        );
    } catch (error) {
      logger.error("Get dashboard error:", error);

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
   * Get detailed company data
   * GET /api/v1/admin/companies/:id/details
   */
  getCompanyDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { companyId } = req.params;

      if (!companyId) {
        res.status(400).json(errorResponse("Company ID is required", 400));
        return;
      }

      const companyDetails = await this.adminDashboardService.getCompanyDetails(
        companyId
      );

      res
        .status(200)
        .json(
          successResponse(
            companyDetails,
            "Company details retrieved successfully"
          )
        );
    } catch (error) {
      logger.error("Get company details error:", error);

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
   * Get all RFQs across all companies
   * GET /api/v1/admin/rfqs
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

      res
        .status(200)
        .json(successResponse(rfqsData, "RFQs retrieved successfully"));
    } catch (error) {
      logger.error("Get all RFQs error:", error);

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
   * Get all quotes across all companies
   * GET /api/v1/admin/quotes
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

      res
        .status(200)
        .json(successResponse(quotesData, "Quotes retrieved successfully"));
    } catch (error) {
      logger.error("Get all quotes error:", error);

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
   * Get all contacts across all companies
   * GET /api/v1/admin/contacts
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

      res
        .status(200)
        .json(successResponse(contactsData, "Contacts retrieved successfully"));
    } catch (error) {
      logger.error("Get all contacts error:", error);

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
   * Get all shipping lines across all companies
   * GET /api/v1/admin/shipping-lines
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

      res
        .status(200)
        .json(
          successResponse(
            shippingLinesData,
            "Shipping lines retrieved successfully"
          )
        );
    } catch (error) {
      logger.error("Get all shipping lines error:", error);

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
   * Get all email logs across all companies
   * GET /api/v1/admin/emails
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

      res
        .status(200)
        .json(
          successResponse(emailLogsData, "Email logs retrieved successfully")
        );
    } catch (error) {
      logger.error("Get all email logs error:", error);

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
   * Get subscription analytics
   * GET /api/v1/admin/analytics/subscriptions
   */
  getSubscriptionAnalytics = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const dashboardData = await this.adminDashboardService.getDashboardData();

      res
        .status(200)
        .json(
          successResponse(
            dashboardData.subscriptionStats,
            "Subscription analytics retrieved successfully"
          )
        );
    } catch (error) {
      logger.error("Get subscription analytics error:", error);

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
   * Get email analytics
   * GET /api/v1/admin/analytics/emails
   */
  getEmailAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const dashboardData = await this.adminDashboardService.getDashboardData();

      res
        .status(200)
        .json(
          successResponse(
            dashboardData.emailStats,
            "Email analytics retrieved successfully"
          )
        );
    } catch (error) {
      logger.error("Get email analytics error:", error);

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
   * Get RFQ analytics
   * GET /api/v1/admin/analytics/rfqs
   */
  getRFQAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const dashboardData = await this.adminDashboardService.getDashboardData();

      res
        .status(200)
        .json(
          successResponse(
            dashboardData.rfqStats,
            "RFQ analytics retrieved successfully"
          )
        );
    } catch (error) {
      logger.error("Get RFQ analytics error:", error);

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
   * Get quote analytics
   * GET /api/v1/admin/analytics/quotes
   */
  getQuoteAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const dashboardData = await this.adminDashboardService.getDashboardData();

      res
        .status(200)
        .json(
          successResponse(
            dashboardData.quoteStats,
            "Quote analytics retrieved successfully"
          )
        );
    } catch (error) {
      logger.error("Get quote analytics error:", error);

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
