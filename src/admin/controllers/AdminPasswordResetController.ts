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
   */
  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, otp, newPassword } = req.body;

      if (!email || !otp || !newPassword) {
        errorResponse(res, "Email, OTP and new password are required", 400);
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

  /**
   * Verify OTP
   * POST /api/v1/admin/auth/verify-otp
   */
  verifyOTP = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        errorResponse(res, "Email and OTP are required", 400);
        return;
      }

      const result = await this.passwordResetService.verifyOTP({
        email: email.toLowerCase(),
        otp,
        userType: UserType.ADMIN,
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
