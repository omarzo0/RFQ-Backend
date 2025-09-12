import { Request, Response } from "express";
import { CompanyRequest } from "../types/auth";
import { CompanyAuthService } from "../services/CompanyAuthService";
import { successResponse, errorResponse } from "../../utils/response";
import { AppError } from "../../utils/errors";
import logger from "../../utils/logger";
import {
  CompanyLoginCredentials,
  CompanyLoginResponse,
  CompanyProfile,
} from "../types/auth";

export class CompanyAuthController {
  private companyAuthService: CompanyAuthService;

  constructor() {
    this.companyAuthService = new CompanyAuthService();
  }

  /**
   * Login company user
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const credentials: CompanyLoginCredentials = req.body;

      // Validate required fields
      if (!credentials.email || !credentials.password) {
        errorResponse(res, "Email and password are required", 400);
        return;
      }

      const result: CompanyLoginResponse =
        await this.companyAuthService.loginCompanyUser(credentials);

      successResponse(res, result, "Company user login successful");
    } catch (error) {
      logger.error("Company user login error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get current company user profile
   */
  getProfile = async (req: CompanyRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user.id;

      const profile: CompanyProfile =
        await this.companyAuthService.getCurrentUser(userId);

      successResponse(
        res,
        profile,
        "Company user profile retrieved successfully"
      );
    } catch (error) {
      logger.error("Get company user profile error:", error);

      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(errorResponse(res, error.message, error.statusCode));
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Change company user password
   */
  changePassword = async (
    req: CompanyRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res
          .status(400)
          .json(
            errorResponse(
              res,
              "Current password and new password are required",
              400
            )
          );
        return;
      }

      await this.companyAuthService.changePassword(
        userId,
        currentPassword,
        newPassword
      );

      successResponse(res, null, "Password changed successfully");
    } catch (error) {
      logger.error("Change company user password error:", error);

      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(errorResponse(res, error.message, error.statusCode));
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

      const tokens = await this.companyAuthService.refreshToken(refreshToken);

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
   * Logout company user
   */
  logout = async (req: CompanyRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user.id;

      await this.companyAuthService.logout(userId);

      successResponse(res, null, "Company user logged out successfully");
    } catch (error) {
      logger.error("Company user logout error:", error);

      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(errorResponse(res, error.message, error.statusCode));
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };
}
