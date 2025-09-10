import { Response, NextFunction, Request } from "express";
import { UserService } from "../services/UserService";
import { successResponse } from "../../utils/response";
import { CompanyRequest } from "../types/auth";

export class UserController {
  private userService = new UserService();

  /**
   * Helper method to safely get user and company ID
   */
  private getUserAndCompanyId(req: CompanyRequest) {
    if (!req.user) {
      throw new Error("User not authenticated");
    }
    if (!req.user.companyId) {
      throw new Error("Company ID not found");
    }
    return {
      userId: req.user.id,
      companyId: req.user.companyId,
    };
  }

  /**
   * GET /api/v1/users
   */
  async getUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page = 1, limit = 10, search, role, status } = (req as any).query;
      const { companyId } = this.getUserAndCompanyId(req as CompanyRequest);

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
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const { companyId } = this.getUserAndCompanyId(req as CompanyRequest);

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
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { companyId } = this.getUserAndCompanyId(req as CompanyRequest);
      const userData = req.body;

      const user = await this.userService.createUser(companyId, userData);

      successResponse(res, user, "User created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/users/:id
   */
  async updateUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const { companyId } = this.getUserAndCompanyId(req as CompanyRequest);
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
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const { companyId } = this.getUserAndCompanyId(req as CompanyRequest);

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
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const { companyId } = this.getUserAndCompanyId(req as CompanyRequest);
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
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const { companyId } = this.getUserAndCompanyId(req as CompanyRequest);
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
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const { companyId } = this.getUserAndCompanyId(req as CompanyRequest);
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
    req: Request,
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
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = this.getUserAndCompanyId(req as CompanyRequest);
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
