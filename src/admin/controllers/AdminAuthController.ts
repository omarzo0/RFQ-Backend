import { Request, Response } from "express";
import { AdminAuthService } from "../services/AdminAuthService";
import { PasswordResetService } from "../../services/PasswordResetService";
import { successResponse, errorResponse } from "../../utils/response";
import { AppError, ValidationError } from "../../utils/errors";
import logger from "../../utils/logger";
import { AdminRequest } from "../middleware/adminAuth";
import {
  AdminLoginCredentials,
  AdminLoginResponse,
  AdminProfile,
} from "../types/auth";
import { UserType } from "@prisma/client";

export class AdminAuthController {
  private adminAuthService: AdminAuthService;
  private passwordResetService: PasswordResetService;

  constructor() {
    this.adminAuthService = new AdminAuthService();
    this.passwordResetService = new PasswordResetService();
  }

  // ─── Login / Logout / Token ──────────────────────────────────────────

  /**
   * Login admin
   * POST /api/v1/admin/auth/login
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const credentials: AdminLoginCredentials = req.body;

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
   * Refresh token
   * POST /api/v1/admin/auth/refresh-token
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
   * POST /api/v1/admin/auth/logout
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

  // ─── Profile & Password ──────────────────────────────────────────────

  /**
   * Get current admin profile
   * GET /api/v1/admin/auth/profile
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

  // ─── Password Reset (Public) ─────────────────────────────────────────

  /**
   * Request password reset — sends OTP to email
   * POST /api/v1/admin/auth/forgot-password
   */
  requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        errorResponse(res, "Email is required", 400);
        return;
      }

      const result = await this.passwordResetService.requestPasswordReset({
        email: email.toLowerCase(),
        userType: UserType.ADMIN,
      });

      successResponse(res, result, result.message, 200);
    } catch (error) {
      logger.error("Admin password reset request error:", error);

      if (error instanceof AppError || error instanceof ValidationError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Verify OTP and reset password
   * POST /api/v1/admin/auth/reset-password
   */
  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, otp, newPassword } = req.body;

      if (!email || !otp || !newPassword) {
        errorResponse(res, "Email, OTP, and new password are required", 400);
        return;
      }

      const result = await this.passwordResetService.verifyOTPAndResetPassword({
        email: email.toLowerCase(),
        otp,
        newPassword,
        userType: UserType.ADMIN,
      });

      successResponse(res, result, result.message, 200);
    } catch (error) {
      logger.error("Admin password reset error:", error);

      if (error instanceof AppError || error instanceof ValidationError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };
}
