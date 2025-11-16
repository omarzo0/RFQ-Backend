import { prisma } from "../../app";
import logger from "../../utils/logger";

export class CompanyWarningService {
  /**
   * Get warnings for a company
   */
  async getCompanyWarnings(
    companyId: string,
    filters?: {
      severity?: string;
      category?: string;
      isResolved?: boolean;
      limit?: number;
      offset?: number;
    }
  ) {
    try {
      const where: any = {
        companyId: companyId,
      };

      // Filter out expired warnings
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ];

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
          select: {
            id: true,
            title: true,
            reason: true,
            severity: true,
            category: true,
            issuedAt: true,
            expiresAt: true,
            isResolved: true,
            resolvedAt: true,
            actionRequired: true,
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
        active: warnings.filter((w) => !w.isResolved).length,
        limit: filters?.limit || 50,
        offset: filters?.offset || 0,
      };
    } catch (error) {
      logger.error("Error getting company warnings:", error);
      throw error;
    }
  }

  /**
   * Get active warning count
   */
  async getActiveWarningCount(companyId: string) {
    try {
      const count = await prisma.companyWarning.count({
        where: {
          companyId: companyId,
          isResolved: false,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
      });

      return { count };
    } catch (error) {
      logger.error("Error getting active warning count:", error);
      throw error;
    }
  }
}

export default CompanyWarningService;
