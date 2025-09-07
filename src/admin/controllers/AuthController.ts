import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { AuthService } from "../services/AuthService";
import { successResponse, errorResponse } from "../utils/response";
import { ValidationError } from "../utils/errors";
import { AuthenticatedRequest } from "../middleware/auth";

const authService = new AuthService();

export class AuthController {
  /**
   * POST /api/v1/auth/login/admin
   */
  async loginAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ValidationError("Validation failed", errors.array());
      }

      const { email, password } = req.body;
      const result = await authService.loginAdmin({ email, password });

      successResponse(res, result, "Admin login successful");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/login/company
   */
  async loginCompany(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ValidationError("Validation failed", errors.array());
      }

      const { email, password } = req.body;
      const result = await authService.loginCompanyUser({ email, password });

      successResponse(res, result, "Login successful");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/register/company
   */
  async registerCompany(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ValidationError("Validation failed", errors.array());
      }

      const result = await authService.registerCompany(req.body);

      successResponse(res, result, "Company registered successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/refresh
   */
  async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new ValidationError("Refresh token is required");
      }

      const tokens = await authService.refreshToken(refreshToken);

      successResponse(res, { tokens }, "Token refreshed successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   */
  async logout(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        return errorResponse(res, "User not authenticated", 401);
      }
      await authService.logout(req.user.id, req.user.userType);
      successResponse(res, null, "Logged out successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/me
   */
  async getCurrentUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        return errorResponse(res, "User not authenticated", 401);
      }
      const user = await authService.getCurrentUser(
        req.user.id,
        req.user.userType
      );
      successResponse(res, user, "User profile retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/auth/change-password
   */
  async changePassword(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        return errorResponse(res, "User not authenticated", 401);
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ValidationError("Validation failed", errors.array());
      }

      const { currentPassword, newPassword } = req.body;

      await authService.changePassword(
        req.user.id,
        req.user.userType,
        currentPassword,
        newPassword
      );

      successResponse(res, null, "Password changed successfully");
    } catch (error) {
      next(error);
    }
  }
}
