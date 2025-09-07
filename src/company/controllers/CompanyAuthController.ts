import { Request, Response } from "express";
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
        res
          .status(400)
          .json(errorResponse("Email and password are required", 400));
        return;
      }

      const result: CompanyLoginResponse =
        await this.companyAuthService.loginCompanyUser(credentials);

      res
        .status(200)
        .json(successResponse(result, "Company user login successful"));
    } catch (error) {
      logger.error("Company user login error:", error);

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
   * Get current company user profile
   */
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json(errorResponse("Unauthorized", 401));
        return;
      }

      const profile: CompanyProfile =
        await this.companyAuthService.getCurrentUser(userId);

      res
        .status(200)
        .json(
          successResponse(
            profile,
            "Company user profile retrieved successfully"
          )
        );
    } catch (error) {
      logger.error("Get company user profile error:", error);

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
   * Change company user password
   */
  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
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

      await this.companyAuthService.changePassword(
        userId,
        currentPassword,
        newPassword
      );

      res
        .status(200)
        .json(successResponse(null, "Password changed successfully"));
    } catch (error) {
      logger.error("Change company user password error:", error);

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

      const tokens = await this.companyAuthService.refreshToken(refreshToken);

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
   * Logout company user
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json(errorResponse("Unauthorized", 401));
        return;
      }

      await this.companyAuthService.logout(userId);

      res
        .status(200)
        .json(successResponse(null, "Company user logged out successfully"));
    } catch (error) {
      logger.error("Company user logout error:", error);

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
