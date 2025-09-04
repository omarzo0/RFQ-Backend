import { Response, NextFunction } from "express";
import { UserService } from "../services/UserService";
import { successResponse } from "../utils/response";
import { AuthenticatedRequest } from "../types/auth";

export class UserController {
  private userService = new UserService();

  /**
   * GET /api/v1/users
   */
  async getUsers(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page = 1, limit = 10, search, role, status } = (req as any).query;
      const companyId = req.user.companyId!;

      const users = await this.userService.getUsers(companyId, {
        page: Number(page),
        limit: Number(limit),
        search,
        role,
        status,
      });

      successResponse(res, users, "Users retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/users/:id
   */
  async getUserById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;

      const user = await this.userService.getUserById(id, companyId);

      successResponse(res, user, "User retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/users
   */
  async createUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;
      const createdBy = req.user.id;
      const userData = req.body;

      const user = await this.userService.createUser(
        companyId,
        createdBy,
        userData
      );

      successResponse(res, user, "User created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/users/:id
   */
  async updateUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;
      const userData = req.body;

      const user = await this.userService.updateUser(id, companyId, userData);

      successResponse(res, user, "User updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/users/:id
   */
  async deleteUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;

      await this.userService.deleteUser(id, companyId);

      successResponse(res, null, "User deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/users/:id/status
   */
  async updateUserStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;
      const { status } = req.body;

      const user = await this.userService.updateUserStatus(
        id,
        companyId,
        status
      );

      successResponse(res, user, "User status updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/users/:id/role
   */
  async updateUserRole(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;
      const { role } = req.body;

      const user = await this.userService.updateUserRole(id, companyId, role);

      successResponse(res, user, "User role updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/users/:id/reset-password
   */
  async resetUserPassword(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;
      const { newPassword } = req.body;

      await this.userService.resetUserPassword(id, companyId, newPassword);

      successResponse(res, null, "Password reset successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/users/roles
   */
  async getUserRoles(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const roles = await this.userService.getUserRoles();

      successResponse(res, roles, "User roles retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/users/permissions
   */
  async getUserPermissions(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user.id;
      const permissions = await this.userService.getUserPermissions(userId);

      successResponse(
        res,
        permissions,
        "User permissions retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
}

