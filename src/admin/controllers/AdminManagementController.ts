import { Request, Response } from "express";
import { AdminManagementService } from "../services/AdminManagementService";
import { successResponse, errorResponse } from "../../utils/response";
import { AppError } from "../../utils/errors";
import logger from "../../utils/logger";
import { AdminRole } from "@prisma/client";

export class AdminManagementController {
  private adminManagementService: AdminManagementService;

  constructor() {
    this.adminManagementService = new AdminManagementService();
  }

  /**
   * Create a new admin
   * POST /api/v1/admin/management/admins
   */
  createAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, firstName, lastName, role, isActive } = req.body;

      // Validate required fields
      if (!email || !password || !firstName || !lastName || !role) {
        errorResponse(
          res,
          "Email, password, firstName, lastName, and role are required",
          400
        );
        return;
      }

      const adminData = {
        email,
        password,
        firstName,
        lastName,
        role,
        isActive,
      };

      const newAdmin = await this.adminManagementService.createAdmin(adminData);

      successResponse(res, newAdmin, "Admin created successfully", 201);
    } catch (error) {
      logger.error("Create admin error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get all admins
   * GET /api/v1/admin/management/admins
   */
  getAdmins = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 20, role, isActive, search } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        role: role ? (role as AdminRole) : undefined,
        isActive:
          isActive === "true" ? true : isActive === "false" ? false : undefined,
        search: search as string,
      };

      const adminsData = await this.adminManagementService.getAdmins(filters);

      successResponse(res, adminsData, "Admins retrieved successfully");
    } catch (error) {
      logger.error("Get admins error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get admin by ID
   * GET /api/v1/admin/management/admins/:id
   */
  getAdminById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        errorResponse(res, "Admin ID is required", 400);
        return;
      }

      const admin = await this.adminManagementService.getAdminById(id);

      successResponse(res, admin, "Admin retrieved successfully");
    } catch (error) {
      logger.error("Get admin by ID error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Update admin
   * PUT /api/v1/admin/management/admins/:id
   */
  updateAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        errorResponse(res, "Admin ID is required", 400);
        return;
      }

      const updatedAdmin = await this.adminManagementService.updateAdmin(
        id,
        updateData
      );

      successResponse(res, updatedAdmin, "Admin updated successfully");
    } catch (error) {
      logger.error("Update admin error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Delete admin (soft delete)
   * DELETE /api/v1/admin/management/admins/:id
   */
  deleteAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        errorResponse(res, "Admin ID is required", 400);
        return;
      }

      const deletedAdmin = await this.adminManagementService.deleteAdmin(id);

      successResponse(res, deletedAdmin, "Admin deactivated successfully");
    } catch (error) {
      logger.error("Delete admin error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Restore admin (reactivate)
   * POST /api/v1/admin/management/admins/:id/restore
   */
  restoreAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        errorResponse(res, "Admin ID is required", 400);
        return;
      }

      const restoredAdmin = await this.adminManagementService.restoreAdmin(id);

      successResponse(res, restoredAdmin, "Admin restored successfully");
    } catch (error) {
      logger.error("Restore admin error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Change admin password
   * POST /api/v1/admin/management/admins/:id/change-password
   */
  changeAdminPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!id) {
        errorResponse(res, "Admin ID is required", 400);
        return;
      }

      if (!newPassword || newPassword.length < 6) {
        errorResponse(
          res,
          "New password is required and must be at least 6 characters",
          400
        );
        return;
      }

      const result = await this.adminManagementService.changeAdminPassword(
        id,
        newPassword
      );

      successResponse(res, result, "Password changed successfully");
    } catch (error) {
      logger.error("Change admin password error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get admin statistics
   * GET /api/v1/admin/management/statistics
   */
  getAdminStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const statistics = await this.adminManagementService.getAdminStatistics();

      successResponse(
        res,
        statistics,
        "Admin statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Get admin statistics error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get admin activity logs
   * GET /api/v1/admin/management/admins/:id/activity
   */
  getAdminActivityLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { limit = 50 } = req.query;

      if (!id) {
        errorResponse(res, "Admin ID is required", 400);
        return;
      }

      const activityLogs =
        await this.adminManagementService.getAdminActivityLogs(
          id,
          parseInt(limit as string)
        );

      successResponse(
        res,
        activityLogs,
        "Admin activity logs retrieved successfully"
      );
    } catch (error) {
      logger.error("Get admin activity logs error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };
}
