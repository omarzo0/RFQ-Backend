import { Response } from "express";
import { AuthenticatedRequest } from "../../types/auth";
import CompanyWarningService from "../services/CompanyWarningService";
import logger from "../../utils/logger";
import { successResponse, errorResponse } from "../../utils/response";

export class CompanyWarningController {
  private warningService: CompanyWarningService;

  constructor() {
    this.warningService = new CompanyWarningService();
  }

  /**
   * GET /api/v1/company/warnings
   */
  getWarnings = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) {
        return errorResponse(res, "Company ID not found", 401);
      }

      const { severity, category, isResolved, limit, offset } = req.query;

      const result = await this.warningService.getCompanyWarnings(companyId, {
        severity: severity as string,
        category: category as string,
        isResolved: isResolved === "true" ? true : isResolved === "false" ? false : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      return successResponse(res, result, "Warnings retrieved successfully");
    } catch (error) {
      logger.error("Error getting company warnings:", error);
      return errorResponse(res, "Failed to retrieve warnings", 500);
    }
  };

  /**
   * GET /api/v1/company/warnings/active-count
   */
  getActiveCount = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) {
        return errorResponse(res, "Company ID not found", 401);
      }

      const result = await this.warningService.getActiveWarningCount(companyId);

      return successResponse(
        res,
        result,
        "Active warning count retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting active warning count:", error);
      return errorResponse(res, "Failed to retrieve active warning count", 500);
    }
  };
}

export default CompanyWarningController;
