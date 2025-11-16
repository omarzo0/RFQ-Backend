import { Request, Response } from "express";
import { PasswordResetService } from "../../services/PasswordResetService";
import { successResponse, errorResponse } from "../../utils/response";
import { AppError, ValidationError } from "../../utils/errors";
import logger from "../../utils/logger";
import { UserType } from "@prisma/client";

export class CompanyPasswordResetController {
  private passwordResetService: PasswordResetService;

  constructor() {
    this.passwordResetService = new PasswordResetService();
  }

  /**
   * Request password reset for company user
   * POST /api/v1/company/auth/forgot-password
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
        userType: UserType.COMPANY_USER,
      });

      successResponse(res, result, result.message, 200);
    } catch (error) {
      logger.error("Company password reset request error:", error);

      if (error instanceof AppError || error instanceof ValidationError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Verify OTP and reset password for company user
   * POST /api/v1/company/auth/reset-password
   * This is a public endpoint - no authentication required
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
        userType: UserType.COMPANY_USER,
      });

      successResponse(res, result, result.message, 200);
    } catch (error) {
      logger.error("Company password reset error:", error);

      if (error instanceof AppError || error instanceof ValidationError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Verify OTP
   * POST /api/v1/company/auth/verify-otp
   * This is a public endpoint - no authentication required
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
        userType: UserType.COMPANY_USER,
      });

      successResponse(res, result, result.message, 200);
    } catch (error) {
      logger.error("Company OTP verification error:", error);

      if (error instanceof AppError || error instanceof ValidationError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };
}
