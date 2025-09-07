import { Request, Response } from "express";
import { AdminAuthService } from "../services/AdminAuthService";
import { successResponse, errorResponse } from "../../utils/response";
import { AppError } from "../../utils/errors";
import logger from "../../utils/logger";
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
        res
          .status(400)
          .json(errorResponse("Email and password are required", 400));
        return;
      }

      const result: AdminLoginResponse = await this.adminAuthService.loginAdmin(
        credentials
      );

      res.status(200).json(successResponse(result, "Admin login successful"));
    } catch (error) {
      logger.error("Admin login error:", error);

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
   * Get current admin profile
   */
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const adminId = req.user?.id;

      if (!adminId) {
        res.status(401).json(errorResponse("Unauthorized", 401));
        return;
      }

      const profile: AdminProfile = await this.adminAuthService.getCurrentAdmin(
        adminId
      );

      res
        .status(200)
        .json(successResponse(profile, "Admin profile retrieved successfully"));
    } catch (error) {
      logger.error("Get admin profile error:", error);

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
   * Change admin password
   */
  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const adminId = req.user?.id;
      const { currentPassword, newPassword } = req.body;

      if (!adminId) {
        res.status(401).json(errorResponse("Unauthorized", 401));
        return;
      }

      if (!currentPassword || !newPassword) {
        res
          .status(400)
          .json(
            errorResponse("Current password and new password are required", 400)
          );
        return;
      }

      await this.adminAuthService.changePassword(
        adminId,
        currentPassword,
        newPassword
      );

      res
        .status(200)
        .json(successResponse(null, "Password changed successfully"));
    } catch (error) {
      logger.error("Change admin password error:", error);

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
   * Refresh token
   */
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json(errorResponse("Refresh token is required", 400));
        return;
      }

      const tokens = await this.adminAuthService.refreshToken(refreshToken);

      res
        .status(200)
        .json(successResponse(tokens, "Token refreshed successfully"));
    } catch (error) {
      logger.error("Refresh token error:", error);

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
   * Logout admin
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const adminId = req.user?.id;

      if (!adminId) {
        res.status(401).json(errorResponse("Unauthorized", 401));
        return;
      }

      await this.adminAuthService.logout(adminId);

      res
        .status(200)
        .json(successResponse(null, "Admin logged out successfully"));
    } catch (error) {
      logger.error("Admin logout error:", error);

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
