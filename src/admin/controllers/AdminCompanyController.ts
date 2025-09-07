import { Request, Response } from "express";
import { AdminCompanyService } from "../services/AdminCompanyService";
import { successResponse, errorResponse } from "../../utils/response";
import { AppError } from "../../utils/errors";
import logger from "../../utils/logger";
import {
  CreateCompanyData,
  UpdateCompanyData,
  CompanyListResponse,
  AdminDashboardStats,
} from "../types/auth";

export class AdminCompanyController {
  private adminCompanyService: AdminCompanyService;

  constructor() {
    this.adminCompanyService = new AdminCompanyService();
  }

  /**
   * Create a new company
   */
  createCompany = async (req: Request, res: Response): Promise<void> => {
    try {
      const companyData: CreateCompanyData = req.body;

      // Validate required fields
      if (!companyData.name || !companyData.email) {
        res
          .status(400)
          .json(errorResponse("Company name and email are required", 400));
        return;
      }

      const company = await this.adminCompanyService.createCompany(companyData);

      res
        .status(201)
        .json(successResponse(company, "Company created successfully"));
    } catch (error) {
      logger.error("Create company error:", error);

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
   * Get all companies with pagination
   */
  getCompanies = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const status = req.query.status as string;

      const result: CompanyListResponse =
        await this.adminCompanyService.getCompanies(
          page,
          limit,
          search,
          status
        );

      res
        .status(200)
        .json(successResponse(result, "Companies retrieved successfully"));
    } catch (error) {
      logger.error("Get companies error:", error);

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
   * Get company by ID
   */
  getCompanyById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { companyId } = req.params;

      if (!companyId) {
        res.status(400).json(errorResponse("Company ID is required", 400));
        return;
      }

      const company = await this.adminCompanyService.getCompanyById(companyId);

      res
        .status(200)
        .json(successResponse(company, "Company retrieved successfully"));
    } catch (error) {
      logger.error("Get company by ID error:", error);

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
   * Update company
   */
  updateCompany = async (req: Request, res: Response): Promise<void> => {
    try {
      const { companyId } = req.params;
      const updateData: Omit<UpdateCompanyData, "id"> = req.body;

      if (!companyId) {
        res.status(400).json(errorResponse("Company ID is required", 400));
        return;
      }

      const company = await this.adminCompanyService.updateCompany({
        id: companyId,
        ...updateData,
      });

      res
        .status(200)
        .json(successResponse(company, "Company updated successfully"));
    } catch (error) {
      logger.error("Update company error:", error);

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
   * Delete company (soft delete)
   */
  deleteCompany = async (req: Request, res: Response): Promise<void> => {
    try {
      const { companyId } = req.params;

      if (!companyId) {
        res.status(400).json(errorResponse("Company ID is required", 400));
        return;
      }

      const company = await this.adminCompanyService.deleteCompany(companyId);

      res
        .status(200)
        .json(successResponse(company, "Company deleted successfully"));
    } catch (error) {
      logger.error("Delete company error:", error);

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
   * Restore company
   */
  restoreCompany = async (req: Request, res: Response): Promise<void> => {
    try {
      const { companyId } = req.params;

      if (!companyId) {
        res.status(400).json(errorResponse("Company ID is required", 400));
        return;
      }

      const company = await this.adminCompanyService.restoreCompany(companyId);

      res
        .status(200)
        .json(successResponse(company, "Company restored successfully"));
    } catch (error) {
      logger.error("Restore company error:", error);

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
   * Get admin dashboard statistics
   */
  getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats: AdminDashboardStats =
        await this.adminCompanyService.getDashboardStats();

      res
        .status(200)
        .json(
          successResponse(stats, "Dashboard statistics retrieved successfully")
        );
    } catch (error) {
      logger.error("Get dashboard stats error:", error);

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
