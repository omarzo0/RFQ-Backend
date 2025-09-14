import { Request, Response } from "express";
import { PasswordResetService } from "../../services/PasswordResetService";
import { successResponse, errorResponse } from "../../utils/response";
import { AppError, ValidationError } from "../../utils/errors";
import logger from "../../utils/logger";
import { UserType } from "@prisma/client";

export class AdminPasswordResetController {
  private passwordResetService: PasswordResetService;

  constructor() {
    this.passwordResetService = new PasswordResetService();
  }

  /**
   * Request password reset for admin
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
   * Verify OTP and reset password for admin
   * POST /api/v1/admin/auth/reset-password
   * Email is extracted from the access token, not from request body
   */
  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { otp, newPassword } = req.body;
      const user = (req as any).user; // Get user from authentication middleware

      if (!otp || !newPassword) {
        errorResponse(res, "OTP and new password are required", 400);
        return;
      }

      if (!user) {
        errorResponse(res, "Authentication required", 401);
        return;
      }

      const result = await this.passwordResetService.verifyOTPAndResetPassword({
        email: user.email,
        otp,
        newPassword,
        userType: UserType.ADMIN,
        userId: user.id,
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

  /**
   * Verify OTP
   * POST /api/v1/admin/auth/verify-otp
   * Email is extracted from the access token, not from request body
   */
  verifyOTP = async (req: Request, res: Response): Promise<void> => {
    try {
      const { otp } = req.body;
      const user = (req as any).user; // Get user from authentication middleware

      if (!otp) {
        errorResponse(res, "OTP is required", 400);
        return;
      }

      if (!user) {
        errorResponse(res, "Authentication required", 401);
        return;
      }

      const result = await this.passwordResetService.verifyOTP({
        email: user.email,
        otp,
        userType: UserType.ADMIN,
        userId: user.id,
      });

      successResponse(res, result, result.message, 200);
    } catch (error) {
      logger.error("Admin OTP verification error:", error);

      if (error instanceof AppError || error instanceof ValidationError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };
}
