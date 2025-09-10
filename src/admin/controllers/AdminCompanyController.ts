import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { AdminCompanyService } from "../services/AdminCompanyService";
import { successResponse, errorResponse } from "../../utils/response";
import { AppError, ValidationError } from "../../utils/errors";
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
        errorResponse(res, "Company name and email are required", 400);
        return;
      }

      const company = await this.adminCompanyService.createCompany(companyData);

      successResponse(res, company, "Company created successfully", 201);
    } catch (error) {
      logger.error("Create company error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
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

      successResponse(res, result, "Companies retrieved successfully");
    } catch (error) {
      logger.error("Get companies error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
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
        errorResponse(res, "Company ID is required", 400);
        return;
      }

      const company = await this.adminCompanyService.getCompanyById(companyId);

      successResponse(res, company, "Company retrieved successfully");
    } catch (error) {
      logger.error("Get company by ID error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
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
        errorResponse(res, "Company ID is required", 400);
        return;
      }

      const company = await this.adminCompanyService.updateCompany({
        id: companyId,
        ...updateData,
      });

      successResponse(res, company, "Company updated successfully");
    } catch (error) {
      logger.error("Update company error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
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
        errorResponse(res, "Company ID is required", 400);
        return;
      }

      const company = await this.adminCompanyService.deleteCompany(companyId);

      successResponse(res, company, "Company deleted successfully");
    } catch (error) {
      logger.error("Delete company error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
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
        errorResponse(res, "Company ID is required", 400);
        return;
      }

      const company = await this.adminCompanyService.restoreCompany(companyId);

      successResponse(res, company, "Company restored successfully");
    } catch (error) {
      logger.error("Restore company error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Create a company user
   */
  createCompanyUser = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check validation results
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ValidationError("Validation failed", errors.array());
      }

      const { email, password, companyId, firstName, lastName, role } =
        req.body;

      const companyUser = await this.adminCompanyService.createCompanyUser({
        email,
        password,
        companyId,
        firstName,
        lastName,
        role: role || "EMPLOYEE",
      });

      successResponse(
        res,
        companyUser,
        "Company user created successfully",
        201
      );
    } catch (error) {
      logger.error("Create company user error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get company users
   */
  getCompanyUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { companyId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!companyId) {
        errorResponse(res, "Company ID is required", 400);
        return;
      }

      const result = await this.adminCompanyService.getCompanyUsers(
        companyId,
        page,
        limit
      );

      successResponse(res, result, "Company users retrieved successfully");
    } catch (error) {
      logger.error("Get company users error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Update company user
   */
  updateCompanyUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const updateData = req.body;

      if (!userId) {
        errorResponse(res, "User ID is required", 400);
        return;
      }

      const companyUser = await this.adminCompanyService.updateCompanyUser(
        userId,
        updateData
      );

      successResponse(res, companyUser, "Company user updated successfully");
    } catch (error) {
      logger.error("Update company user error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Delete company user
   */
  deleteCompanyUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      if (!userId) {
        errorResponse(res, "User ID is required", 400);
        return;
      }

      await this.adminCompanyService.deleteCompanyUser(userId);

      successResponse(res, null, "Company user deleted successfully");
    } catch (error) {
      logger.error("Delete company user error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
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

      successResponse(
        res,
        stats,
        "Dashboard statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Get dashboard stats error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };
}
