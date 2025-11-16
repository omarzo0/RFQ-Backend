import { prisma } from "../../app";
import logger from "../../utils/logger";

export interface CreateWarningData {
  companyId: string;
  title: string;
  reason: string;
  severity?: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  category?: "GENERAL" | "PAYMENT" | "POLICY_VIOLATION" | "SECURITY" | "PERFORMANCE" | "COMPLIANCE" | "ABUSE" | "OTHER";
  expiresAt?: Date;
  actionRequired?: string;
  notes?: string;
}

export class WarningService {
  /**
   * Issue a warning to a company
   */
  async issueWarning(adminId: string, data: CreateWarningData) {
    try {
      const warning = await prisma.companyWarning.create({
        data: {
          companyId: data.companyId,
          title: data.title,
          reason: data.reason,
          severity: data.severity || "MODERATE",
          category: data.category || "GENERAL",
          expiresAt: data.expiresAt,
          actionRequired: data.actionRequired,
          notes: data.notes,
          issuedBy: adminId,
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
        `Warning issued by admin ${adminId} to company ${data.companyId}: ${warning.id} (Severity: ${warning.severity})`
      );

      return warning;
    } catch (error) {
      logger.error("Error issuing warning:", error);
      throw error;
    }
  }

  /**
   * Get all warnings with filters (admin view)
   */
  async getAllWarnings(filters?: {
    companyId?: string;
    severity?: string;
    category?: string;
    isResolved?: boolean;
    limit?: number;
    offset?: number;
  }) {
    try {
      const where: any = {};

      if (filters?.companyId) {
        where.companyId = filters.companyId;
      }

      if (filters?.severity) {
        where.severity = filters.severity;
      }

      if (filters?.category) {
        where.category = filters.category;
      }

      if (filters?.isResolved !== undefined) {
        where.isResolved = filters.isResolved;
      }

      const [warnings, total] = await Promise.all([
        prisma.companyWarning.findMany({
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
            resolver: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: [
            { isResolved: "asc" },
            { severity: "desc" },
            { issuedAt: "desc" },
          ],
          take: filters?.limit || 50,
          skip: filters?.offset || 0,
        }),
        prisma.companyWarning.count({ where }),
      ]);

      return {
        warnings,
        total,
        limit: filters?.limit || 50,
        offset: filters?.offset || 0,
      };
    } catch (error) {
      logger.error("Error getting warnings:", error);
      throw error;
    }
  }

  /**
   * Resolve a warning
   */
  async resolveWarning(warningId: string, adminId: string) {
    try {
      const warning = await prisma.companyWarning.update({
        where: { id: warningId },
        data: {
          isResolved: true,
          resolvedAt: new Date(),
          resolvedBy: adminId,
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      logger.info(
        `Warning ${warningId} resolved by admin ${adminId} for company ${warning.companyId}`
      );

      return warning;
    } catch (error) {
      logger.error("Error resolving warning:", error);
      throw error;
    }
  }

  /**
   * Delete a warning
   */
  async deleteWarning(warningId: string) {
    try {
      await prisma.companyWarning.delete({
        where: { id: warningId },
      });

      logger.info(`Warning deleted: ${warningId}`);
    } catch (error) {
      logger.error("Error deleting warning:", error);
      throw error;
    }
  }

  /**
   * Get warning statistics
   */
  async getWarningStats() {
    try {
      const [total, active, bySeverity, byCategory] = await Promise.all([
        prisma.companyWarning.count(),
        prisma.companyWarning.count({ where: { isResolved: false } }),
        prisma.companyWarning.groupBy({
          by: ["severity"],
          _count: true,
          where: { isResolved: false },
        }),
        prisma.companyWarning.groupBy({
          by: ["category"],
          _count: true,
          where: { isResolved: false },
        }),
      ]);

      return {
        total,
        active,
        resolved: total - active,
        bySeverity: bySeverity.reduce((acc, item) => {
          acc[item.severity] = item._count;
          return acc;
        }, {} as Record<string, number>),
        byCategory: byCategory.reduce((acc, item) => {
          acc[item.category] = item._count;
          return acc;
        }, {} as Record<string, number>),
      };
    } catch (error) {
      logger.error("Error getting warning stats:", error);
      throw error;
    }
  }
}

export default WarningService;
