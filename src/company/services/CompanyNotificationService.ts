import { prisma } from "../../app";
import logger from "../../utils/logger";

export class CompanyNotificationService {
  /**
   * Get notifications for a company
   */
  async getCompanyNotifications(
    companyId: string,
    filters?: {
      isRead?: boolean;
      type?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    try {
      const where: any = {
        AND: [
          {
            OR: [
              { companyId: companyId },
              { isGlobal: true },
            ],
          },
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
          },
        ],
      };

      if (filters?.isRead !== undefined) {
        where.AND.push({ isRead: filters.isRead });
      }

      if (filters?.type) {
        where.AND.push({ type: filters.type });
      }

      logger.info(`Fetching notifications for company ${companyId} with filters:`, { where, filters });

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          select: {
            id: true,
            title: true,
            message: true,
            type: true,
            priority: true,
            isGlobal: true,
            isRead: true,
            createdAt: true,
            readAt: true,
            expiresAt: true,
            actionUrl: true,
            actionLabel: true,
          },
          orderBy: [
            { priority: "desc" },
            { createdAt: "desc" },
          ],
          take: filters?.limit || 50,
          skip: filters?.offset || 0,
        }),
        prisma.notification.count({ where }),
      ]);

      logger.info(`Query result: Found ${total} total notifications, ${notifications.length} returned`, {
        notifications: notifications.map(n => ({ id: n.id, title: n.title, isGlobal: n.isGlobal, isRead: n.isRead }))
      });

      return {
        notifications,
        total,
        unread: notifications.filter((n: any) => !n.isRead).length,
        limit: filters?.limit || 50,
        offset: filters?.offset || 0,
      };
    } catch (error) {
      logger.error("Error getting company notifications:", error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, companyId: string) {
    try {
      // Verify notification belongs to company or is global
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          OR: [
            { companyId: companyId },
            { isGlobal: true },
          ],
        },
      });

      if (!notification) {
        throw new Error("Notification not found");
      }

      const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      logger.info(
        `Notification marked as read: ${notificationId} by company ${companyId}`
      );

      return updated;
    } catch (error) {
      logger.error("Error marking notification as read:", error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(companyId: string) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          OR: [
            { companyId: companyId },
            { isGlobal: true },
          ],
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      logger.info(
        `All notifications marked as read for company ${companyId} (${result.count} notifications)`
      );

      return { count: result.count };
    } catch (error) {
      logger.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(companyId: string) {
    try {
      const count = await prisma.notification.count({
        where: {
          AND: [
            {
              OR: [
                { companyId: companyId },
                { isGlobal: true },
              ],
            },
            {
              isRead: false,
            },
            {
              OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } },
              ],
            },
          ],
        },
      });

      return { count };
    } catch (error) {
      logger.error("Error getting unread count:", error);
      throw error;
    }
  }
}

export default CompanyNotificationService;
