import { Request, Response } from "express";
import { AdminSubscriptionPlanService } from "../services/AdminSubscriptionPlanService";
import { successResponse, errorResponse } from "../../utils/response";
import { AppError } from "../../utils/errors";
import logger from "../../utils/logger";
import { FEATURE_REGISTRY } from "../../config/featureRegistry";

export class AdminSubscriptionPlanController {
  private adminSubscriptionPlanService: AdminSubscriptionPlanService;

  constructor() {
    this.adminSubscriptionPlanService = new AdminSubscriptionPlanService();
  }

  /**
   * Get the feature registry – all features the system supports.
   * GET /api/v1/admin/subscription-plans/feature-registry
   *
   * The admin UI should call this when building the plan creation form
   * so it knows exactly which feature keys are valid and what they mean.
   */
  getFeatureRegistry = async (_req: Request, res: Response): Promise<void> => {
    try {
      // Group features by category for easier UI rendering
      const grouped: Record<string, typeof FEATURE_REGISTRY> = {};
      for (const feature of FEATURE_REGISTRY) {
        if (!grouped[feature.category]) grouped[feature.category] = [];
        grouped[feature.category].push(feature);
      }

      successResponse(
        res,
        {
          features: FEATURE_REGISTRY,
          grouped,
          totalFeatures: FEATURE_REGISTRY.length,
        },
        "Feature registry retrieved successfully",
        200
      );
    } catch (error) {
      logger.error("Get feature registry error:", error);
      errorResponse(res, "Internal server error", 500);
    }
  };

  /**
   * Get all subscription plans
   * GET /api/v1/admin/subscription-plans
   */
  getSubscriptionPlans = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 20, isActive, search } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        isActive: isActive ? isActive === "true" : undefined,
        search: search as string,
      };

      const subscriptionPlansData =
        await this.adminSubscriptionPlanService.getSubscriptionPlans(filters);

      successResponse(
        res,
        subscriptionPlansData,
        "Subscription plans retrieved successfully",
        200
      );
    } catch (error) {
      logger.error("Get subscription plans error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get subscription plan by ID
   * GET /api/v1/admin/subscription-plans/:id
   */
  getSubscriptionPlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        errorResponse(res, "Subscription plan ID is required", 400);
        return;
      }

      const subscriptionPlan =
        await this.adminSubscriptionPlanService.getSubscriptionPlanById(id);

      successResponse(
        res,
        subscriptionPlan,
        "Subscription plan retrieved successfully",
        200
      );
    } catch (error) {
      logger.error("Get subscription plan error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Create new subscription plan
   * POST /api/v1/admin/subscription-plans
   */
  createSubscriptionPlan = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const planData = req.body;

      // Validate required fields
      if (!planData.name) {
        errorResponse(res, "Plan name is required", 400);
        return;
      }

      const subscriptionPlan =
        await this.adminSubscriptionPlanService.createSubscriptionPlan(
          planData
        );

      successResponse(
        res,
        subscriptionPlan,
        "Subscription plan created successfully",
        201
      );
    } catch (error) {
      logger.error("Create subscription plan error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Update subscription plan
   * PUT /api/v1/admin/subscription-plans/:id
   */
  updateSubscriptionPlan = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        errorResponse(res, "Subscription plan ID is required", 400);
        return;
      }

      const subscriptionPlan =
        await this.adminSubscriptionPlanService.updateSubscriptionPlan(
          id,
          updateData
        );

      successResponse(
        res,
        subscriptionPlan,
        "Subscription plan updated successfully",
        200
      );
    } catch (error) {
      logger.error("Update subscription plan error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Delete subscription plan
   * DELETE /api/v1/admin/subscription-plans/:id
   */
  deleteSubscriptionPlan = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        errorResponse(res, "Subscription plan ID is required", 400);
        return;
      }

      await this.adminSubscriptionPlanService.deleteSubscriptionPlan(id);

      successResponse(res, null, "Subscription plan deleted successfully", 200);
    } catch (error) {
      logger.error("Delete subscription plan error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Toggle subscription plan active status
   * PATCH /api/v1/admin/subscription-plans/:id/toggle-status
   */
  toggleSubscriptionPlanStatus = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        errorResponse(res, "Subscription plan ID is required", 400);
        return;
      }

      const subscriptionPlan =
        await this.adminSubscriptionPlanService.toggleSubscriptionPlanStatus(
          id
        );

      successResponse(
        res,
        subscriptionPlan,
        "Subscription plan status updated successfully",
        200
      );
    } catch (error) {
      logger.error("Toggle subscription plan status error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get subscription plan usage statistics
   * GET /api/v1/admin/subscription-plans/:id/usage
   */
  getSubscriptionPlanUsage = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        errorResponse(res, "Subscription plan ID is required", 400);
        return;
      }

      const usageStats =
        await this.adminSubscriptionPlanService.getSubscriptionPlanUsage(id);

      successResponse(
        res,
        usageStats,
        "Subscription plan usage statistics retrieved successfully",
        200
      );
    } catch (error) {
      logger.error("Get subscription plan usage error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };
}
