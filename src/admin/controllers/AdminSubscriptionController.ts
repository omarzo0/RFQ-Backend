import { Request, Response } from "express";
import { AdminSubscriptionService } from "../services/AdminSubscriptionService";
import { successResponse, errorResponse } from "../../utils/response";
import { AppError } from "../../utils/errors";
import logger from "../../utils/logger";

export class AdminSubscriptionController {
  private adminSubscriptionService: AdminSubscriptionService;

  constructor() {
    this.adminSubscriptionService = new AdminSubscriptionService();
  }

  /**
   * Get all subscriptions
   * GET /api/v1/admin/subscriptions
   */
  getSubscriptions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 20, status, plan, search } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
        plan: plan as string,
        search: search as string,
      };

      const subscriptionsData =
        await this.adminSubscriptionService.getSubscriptions(filters);

      res
        .status(200)
        .json(
          successResponse(
            subscriptionsData,
            "Subscriptions retrieved successfully"
          )
        );
    } catch (error) {
      logger.error("Get subscriptions error:", error);

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
   * Get subscription by company ID
   * GET /api/v1/admin/subscriptions/:companyId
   */
  getSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const { companyId } = req.params;

      if (!companyId) {
        res.status(400).json(errorResponse("Company ID is required", 400));
        return;
      }

      const subscription =
        await this.adminSubscriptionService.getSubscriptionByCompanyId(
          companyId
        );

      res
        .status(200)
        .json(
          successResponse(subscription, "Subscription retrieved successfully")
        );
    } catch (error) {
      logger.error("Get subscription error:", error);

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
   * Update subscription
   * PUT /api/v1/admin/subscriptions/:companyId
   */
  updateSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const { companyId } = req.params;
      const updateData = req.body;

      if (!companyId) {
        res.status(400).json(errorResponse("Company ID is required", 400));
        return;
      }

      const updatedSubscription =
        await this.adminSubscriptionService.updateSubscription(
          companyId,
          updateData
        );

      res
        .status(200)
        .json(
          successResponse(
            updatedSubscription,
            "Subscription updated successfully"
          )
        );
    } catch (error) {
      logger.error("Update subscription error:", error);

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
   * Suspend subscription
   * POST /api/v1/admin/subscriptions/:companyId/suspend
   */
  suspendSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const { companyId } = req.params;
      const { reason } = req.body;

      if (!companyId) {
        res.status(400).json(errorResponse("Company ID is required", 400));
        return;
      }

      const suspendedSubscription =
        await this.adminSubscriptionService.suspendSubscription(
          companyId,
          reason
        );

      res
        .status(200)
        .json(
          successResponse(
            suspendedSubscription,
            "Subscription suspended successfully"
          )
        );
    } catch (error) {
      logger.error("Suspend subscription error:", error);

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
   * Reactivate subscription
   * POST /api/v1/admin/subscriptions/:companyId/reactivate
   */
  reactivateSubscription = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { companyId } = req.params;

      if (!companyId) {
        res.status(400).json(errorResponse("Company ID is required", 400));
        return;
      }

      const reactivatedSubscription =
        await this.adminSubscriptionService.reactivateSubscription(companyId);

      res
        .status(200)
        .json(
          successResponse(
            reactivatedSubscription,
            "Subscription reactivated successfully"
          )
        );
    } catch (error) {
      logger.error("Reactivate subscription error:", error);

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
   * Cancel subscription
   * POST /api/v1/admin/subscriptions/:companyId/cancel
   */
  cancelSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const { companyId } = req.params;
      const { reason } = req.body;

      if (!companyId) {
        res.status(400).json(errorResponse("Company ID is required", 400));
        return;
      }

      const canceledSubscription =
        await this.adminSubscriptionService.cancelSubscription(
          companyId,
          reason
        );

      res
        .status(200)
        .json(
          successResponse(
            canceledSubscription,
            "Subscription canceled successfully"
          )
        );
    } catch (error) {
      logger.error("Cancel subscription error:", error);

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
   * Extend trial
   * POST /api/v1/admin/subscriptions/:companyId/extend-trial
   */
  extendTrial = async (req: Request, res: Response): Promise<void> => {
    try {
      const { companyId } = req.params;
      const { days } = req.body;

      if (!companyId) {
        res.status(400).json(errorResponse("Company ID is required", 400));
        return;
      }

      if (!days || days <= 0) {
        res
          .status(400)
          .json(errorResponse("Valid number of days is required", 400));
        return;
      }

      const extendedSubscription =
        await this.adminSubscriptionService.extendTrial(companyId, days);

      res
        .status(200)
        .json(
          successResponse(extendedSubscription, "Trial extended successfully")
        );
    } catch (error) {
      logger.error("Extend trial error:", error);

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
   * Get subscription analytics
   * GET /api/v1/admin/subscriptions/analytics
   */
  getSubscriptionAnalytics = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const analytics =
        await this.adminSubscriptionService.getSubscriptionAnalytics();

      res
        .status(200)
        .json(
          successResponse(
            analytics,
            "Subscription analytics retrieved successfully"
          )
        );
    } catch (error) {
      logger.error("Get subscription analytics error:", error);

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
   * Get expiring trials
   * GET /api/v1/admin/subscriptions/expiring-trials
   */
  getExpiringTrials = async (req: Request, res: Response): Promise<void> => {
    try {
      const { days = 7 } = req.query;
      const daysNumber = parseInt(days as string);

      const expiringTrials =
        await this.adminSubscriptionService.getExpiringTrials(daysNumber);

      res
        .status(200)
        .json(
          successResponse(
            expiringTrials,
            "Expiring trials retrieved successfully"
          )
        );
    } catch (error) {
      logger.error("Get expiring trials error:", error);

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
   * Get subscription usage
   * GET /api/v1/admin/subscriptions/:companyId/usage
   */
  getSubscriptionUsage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { companyId } = req.params;

      if (!companyId) {
        res.status(400).json(errorResponse("Company ID is required", 400));
        return;
      }

      const usage = await this.adminSubscriptionService.getSubscriptionUsage(
        companyId
      );

      res
        .status(200)
        .json(
          successResponse(usage, "Subscription usage retrieved successfully")
        );
    } catch (error) {
      logger.error("Get subscription usage error:", error);

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
