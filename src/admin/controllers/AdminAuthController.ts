import { Request, Response } from "express";
import { AdminAuthService } from "../services/AdminAuthService";
import { successResponse, errorResponse } from "../../utils/response";
import { AppError } from "../../utils/errors";
import logger from "../../utils/logger";
import { AdminRequest } from "../middleware/adminAuth";
import {
  AdminLoginCredentials,
  AdminLoginResponse,
  AdminProfile,
} from "../types/auth";

export class AdminAuthController {
  private adminAuthService: AdminAuthService;

  constructor() {
    this.adminAuthService = new AdminAuthService();
  }

  /**
   * Login admin
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const credentials: AdminLoginCredentials = req.body;

      // Validate required fields
      if (!credentials.email || !credentials.password) {
        errorResponse(res, "Email and password are required", 400);
        return;
      }

      const result: AdminLoginResponse = await this.adminAuthService.loginAdmin(
        credentials
      );

      successResponse(res, result, "Admin login successful");
    } catch (error) {
      logger.error("Admin login error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get current admin profile
   */
  getProfile = async (req: AdminRequest, res: Response): Promise<void> => {
    try {
      const adminId = req.user?.id;

      if (!adminId) {
        errorResponse(res, "Unauthorized", 401);
        return;
      }

      const profile: AdminProfile = await this.adminAuthService.getCurrentAdmin(
        adminId
      );

      successResponse(res, profile, "Admin profile retrieved successfully");
    } catch (error) {
      logger.error("Get admin profile error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Change admin password
   */
  changePassword = async (req: AdminRequest, res: Response): Promise<void> => {
    try {
      const adminId = req.user?.id;
      const { currentPassword, newPassword } = req.body;

      if (!adminId) {
        errorResponse(res, "Unauthorized", 401);
        return;
      }

      if (!currentPassword || !newPassword) {
        errorResponse(
          res,
          "Current password and new password are required",
          400
        );
        return;
      }

      await this.adminAuthService.changePassword(
        adminId,
        currentPassword,
        newPassword
      );

      successResponse(
        res,
        null,
        "Password changed successfully. You will need to log in again with your new password."
      );
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
   * Refresh token
   */
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        errorResponse(res, "Refresh token is required", 400);
        return;
      }

      const tokens = await this.adminAuthService.refreshToken(refreshToken);

      successResponse(res, tokens, "Token refreshed successfully");
    } catch (error) {
      logger.error("Refresh token error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Logout admin
   */
  logout = async (req: AdminRequest, res: Response): Promise<void> => {
    try {
      const adminId = req.user?.id;

      if (!adminId) {
        errorResponse(res, "Unauthorized", 401);
        return;
      }

      await this.adminAuthService.logout(adminId);

      successResponse(res, null, "Admin logged out successfully");
    } catch (error) {
      logger.error("Admin logout error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };
}
