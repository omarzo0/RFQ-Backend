import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { body, query, validationResult } from "express-validator";
import NotificationService from "../services/NotificationService";
import logger from "../../utils/logger";
import { successResponse, errorResponse } from "../../utils/response";

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * POST /api/v1/admin/notifications
   */
  createNotification = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, "Validation failed", 400, errors.array());
      }

      const adminId = req.user?.id;
      if (!adminId) {
        return errorResponse(res, "Admin ID not found", 401);
      }

      const notification = await this.notificationService.createNotification(
        adminId,
        req.body
      );

      return successResponse(
        res,
        notification,
        "Notification created successfully",
        201
      );
    } catch (error) {
      logger.error("Error creating notification:", error);
      return errorResponse(res, "Failed to create notification", 500);
    }
  };

  /**
   * GET /api/v1/admin/notifications
   */
  getAllNotifications = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { companyId, isGlobal, type, limit, offset } = req.query;

      const result = await this.notificationService.getAllNotifications({
        companyId: companyId as string,
        isGlobal: isGlobal === "true" ? true : isGlobal === "false" ? false : undefined,
        type: type as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      return successResponse(
        res,
        result,
        "Notifications retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting notifications:", error);
      return errorResponse(res, "Failed to retrieve notifications", 500);
    }
  };

  /**
   * DELETE /api/v1/admin/notifications/:id
   */
  deleteNotification = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;

      await this.notificationService.deleteNotification(id);

      return successResponse(res, null, "Notification deleted successfully");
    } catch (error) {
      logger.error("Error deleting notification:", error);
      return errorResponse(res, "Failed to delete notification", 500);
    }
  };

  /**
   * GET /api/v1/admin/notifications/stats
   */
  getNotificationStats = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const stats = await this.notificationService.getNotificationStats();

      return successResponse(
        res,
        stats,
        "Notification statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting notification stats:", error);
      return errorResponse(
        res,
        "Failed to retrieve notification statistics",
        500
      );
    }
  };
}

export const createNotificationValidation = [
  body("title")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Title is required"),
  body("message")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Message is required"),
  body("type")
    .optional()
    .isIn(["INFO", "SUCCESS", "WARNING", "ERROR", "ANNOUNCEMENT", "SYSTEM", "BILLING", "FEATURE", "MAINTENANCE"])
    .withMessage("Invalid notification type"),
  body("priority")
    .optional()
    .isIn(["LOW", "NORMAL", "HIGH", "URGENT"])
    .withMessage("Invalid priority"),
  body("companyId")
    .optional()
    .isString()
    .withMessage("Company ID must be a string"),
  body("isGlobal")
    .optional()
    .isBoolean()
    .withMessage("isGlobal must be a boolean"),
  body("expiresAt")
    .optional()
    .isISO8601()
    .withMessage("expiresAt must be a valid date"),
  body("actionUrl")
    .optional()
    .isString()
    .withMessage("actionUrl must be a string"),
  body("actionLabel")
    .optional()
    .isString()
    .withMessage("actionLabel must be a string"),
];

export default NotificationController;
