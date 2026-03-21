import { prisma } from "../../app";
import logger from "../../utils/logger";
import { NotificationAudience } from "@prisma/client";

export interface CreateNotificationData {
  title: string;
  message: string;
  type?: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "ANNOUNCEMENT" | "SYSTEM" | "BILLING" | "FEATURE" | "MAINTENANCE";
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  companyId?: string;
  isGlobal?: boolean;
  audience?: NotificationAudience;
  expiresAt?: Date;
  actionUrl?: string;
  actionLabel?: string;
}

export class NotificationService {
  /**
   * Create a notification
   */
  async createNotification(
    adminId: string,
    data: CreateNotificationData
  ) {
    try {
      const notification = await prisma.notification.create({
        data: {
          title: data.title,
          message: data.message,
          type: data.type || "INFO",
          priority: data.priority || "NORMAL",
          companyId: data.companyId,
          isGlobal: data.isGlobal || false,
          audience: data.audience || "ALL",
          expiresAt: data.expiresAt,
          actionUrl: data.actionUrl,
          actionLabel: data.actionLabel,
          createdBy: adminId,
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          admin: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      logger.info(
        `Notification created by admin ${adminId}: ${notification.id} (Global: ${notification.isGlobal}, Company: ${notification.companyId || "N/A"})`
      );

      return notification;
    } catch (error) {
      logger.error("Error creating notification:", error);
      throw error;
    }
  }

  /**
   * Get all notifications (admin view)
   * - By default (no filters), shows ALL notifications
   * - Can filter by companyId to see ONLY that company's specific notifications (isGlobal=false)
   * - Can pass isGlobal=true to see only global notifications
   * - Can pass isGlobal=false to see all company-specific notifications
   */
  async getAllNotifications(filters?: {
    companyId?: string;
    isGlobal?: boolean;
    audience?: NotificationAudience;
    type?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const where: any = {};

      // If companyId is provided, show ONLY that company's specific notifications
      if (filters?.companyId) {
        where.companyId = filters.companyId;
        where.isGlobal = false;
      } else if (filters?.isGlobal !== undefined) {
        // If isGlobal filter is explicitly set, use it
        where.isGlobal = filters.isGlobal;
      }
      // If no filters provided, show ALL notifications (don't set any where clause)

      if (filters?.type) {
        where.type = filters.type;
      }

      if (filters?.audience) {
        where.audience = filters.audience;
      }

      logger.info(`[Admin NotificationService] Fetching notifications with filters:`, filters);

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          include: {
            company: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            admin: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: filters?.limit || 50,
          skip: filters?.offset || 0,
        }),
        prisma.notification.count({ where }),
      ]);

      logger.info(`[Admin NotificationService] Found ${total} notifications, returning ${notifications.length}`, {
        notificationIds: notifications.map(n => ({ id: n.id, title: n.title, isGlobal: n.isGlobal, companyId: n.companyId }))
      });

      return {
        notifications,
        total,
        limit: filters?.limit || 50,
        offset: filters?.offset || 0,
      };
    } catch (error) {
      logger.error("Error getting all notifications:", error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string) {
    try {
      await prisma.notification.delete({
        where: { id: notificationId },
      });

      logger.info(`Notification deleted: ${notificationId}`);
      return { success: true };
    } catch (error) {
      logger.error("Error deleting notification:", error);
      throw error;
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats() {
    try {
      const [total, global, specific, unread, byType] = await Promise.all([
        prisma.notification.count(),
        prisma.notification.count({ where: { isGlobal: true } }),
        prisma.notification.count({ where: { isGlobal: false } }),
        prisma.notification.count({ where: { isRead: false } }),
        prisma.notification.groupBy({
          by: ["type"],
          _count: true,
        }),
      ]);

      return {
        total,
        global,
        specific,
        unread,
        byType: byType.reduce((acc, item) => {
          acc[item.type] = item._count;
          return acc;
        }, {} as Record<string, number>),
      };
    } catch (error) {
      logger.error("Error getting notification stats:", error);
      throw error;
    }
  }
}

export default NotificationService;
