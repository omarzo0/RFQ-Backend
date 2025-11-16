import { Response } from "express";
import { AuthenticatedRequest } from "../../types/auth";
import { validationResult } from "express-validator";
import CompanyNotificationService from "../services/CompanyNotificationService";
import logger from "../../utils/logger";
import { successResponse, errorResponse } from "../../utils/response";

export class CompanyNotificationController {
  private notificationService: CompanyNotificationService;

  constructor() {
    this.notificationService = new CompanyNotificationService();
  }

  /**
   * GET /api/v1/company/notifications
   */
  getNotifications = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const companyId = req.user?.companyId;
      logger.info(`[NotificationController] Getting notifications for company: ${companyId}`);
      
      if (!companyId) {
        return errorResponse(res, "Company ID not found", 401);
      }

      const { type, isRead, limit, offset } = req.query;

      const result = await this.notificationService.getCompanyNotifications(
        companyId,
        {
          type: type as string,
          isRead: isRead === "true" ? true : isRead === "false" ? false : undefined,
          limit: limit ? parseInt(limit as string) : undefined,
          offset: offset ? parseInt(offset as string) : undefined,
        }
      );

      logger.info(`[NotificationController] Found ${result.total} notifications`, result);

      return successResponse(
        res,
        result,
        "Notifications retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting company notifications:", error);
      return errorResponse(res, "Failed to retrieve notifications", 500);
    }
  };

  /**
   * PUT /api/v1/company/notifications/:id/read
   */
  markAsRead = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) {
        return errorResponse(res, "Company ID not found", 401);
      }

      const { id } = req.params;

      const notification = await this.notificationService.markAsRead(
        id,
        companyId
      );

      return successResponse(
        res,
        notification,
        "Notification marked as read"
      );
    } catch (error) {
      logger.error("Error marking notification as read:", error);
      return errorResponse(res, "Failed to mark notification as read", 500);
    }
  };

  /**
   * PUT /api/v1/company/notifications/read-all
   */
  markAllAsRead = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) {
        return errorResponse(res, "Company ID not found", 401);
      }

      await this.notificationService.markAllAsRead(companyId);

      return successResponse(
        res,
        null,
        "All notifications marked as read"
      );
    } catch (error) {
      logger.error("Error marking all notifications as read:", error);
      return errorResponse(
        res,
        "Failed to mark all notifications as read",
        500
      );
    }
  };

  /**
   * GET /api/v1/company/notifications/unread-count
   */
  getUnreadCount = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) {
        return errorResponse(res, "Company ID not found", 401);
      }

      const count = await this.notificationService.getUnreadCount(companyId);

      return successResponse(
        res,
        { count },
        "Unread count retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting unread count:", error);
      return errorResponse(res, "Failed to retrieve unread count", 500);
    }
  };
}

export default CompanyNotificationController;
