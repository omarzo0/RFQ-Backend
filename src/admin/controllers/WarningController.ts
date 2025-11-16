import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { body, validationResult } from "express-validator";
import WarningService from "../services/WarningService";
import logger from "../../utils/logger";
import { successResponse, errorResponse } from "../../utils/response";

export class WarningController {
  private warningService: WarningService;

  constructor() {
    this.warningService = new WarningService();
  }

  /**
   * POST /api/v1/admin/warnings
   */
  issueWarning = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, "Validation failed", 400, errors.array());
      }

      const adminId = req.user?.id;
      if (!adminId) {
        return errorResponse(res, "Admin ID not found", 401);
      }

      const warning = await this.warningService.issueWarning(adminId, req.body);

      return successResponse(
        res,
        warning,
        "Warning issued successfully",
        201
      );
    } catch (error) {
      logger.error("Error issuing warning:", error);
      return errorResponse(res, "Failed to issue warning", 500);
    }
  };

  /**
   * GET /api/v1/admin/warnings
   */
  getAllWarnings = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { companyId, severity, category, isResolved, limit, offset } = req.query;

      const result = await this.warningService.getAllWarnings({
        companyId: companyId as string,
        severity: severity as string,
        category: category as string,
        isResolved: isResolved === "true" ? true : isResolved === "false" ? false : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      return successResponse(res, result, "Warnings retrieved successfully");
    } catch (error) {
      logger.error("Error getting warnings:", error);
      return errorResponse(res, "Failed to retrieve warnings", 500);
    }
  };

  /**
   * PUT /api/v1/admin/warnings/:id/resolve
   */
  resolveWarning = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const adminId = req.user?.id;

      if (!adminId) {
        return errorResponse(res, "Admin ID not found", 401);
      }

      const warning = await this.warningService.resolveWarning(id, adminId);

      return successResponse(res, warning, "Warning resolved successfully");
    } catch (error) {
      logger.error("Error resolving warning:", error);
      return errorResponse(res, "Failed to resolve warning", 500);
    }
  };

  /**
   * DELETE /api/v1/admin/warnings/:id
   */
  deleteWarning = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;

      await this.warningService.deleteWarning(id);

      return successResponse(res, null, "Warning deleted successfully");
    } catch (error) {
      logger.error("Error deleting warning:", error);
      return errorResponse(res, "Failed to delete warning", 500);
    }
  };

  /**
   * GET /api/v1/admin/warnings/stats
   */
  getWarningStats = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const stats = await this.warningService.getWarningStats();

      return successResponse(
        res,
        stats,
        "Warning statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting warning stats:", error);
      return errorResponse(
        res,
        "Failed to retrieve warning statistics",
        500
      );
    }
  };
}

export const issueWarningValidation = [
  body("companyId")
    .isString()
    .notEmpty()
    .withMessage("Company ID is required"),
  body("title")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Title is required"),
  body("reason")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Reason is required"),
  body("severity")
    .optional()
    .isIn(["LOW", "MODERATE", "HIGH", "CRITICAL"])
    .withMessage("Invalid severity level"),
  body("category")
    .optional()
    .isIn(["GENERAL", "PAYMENT", "POLICY_VIOLATION", "SECURITY", "PERFORMANCE", "COMPLIANCE", "ABUSE", "OTHER"])
    .withMessage("Invalid category"),
  body("expiresAt")
    .optional()
    .isISO8601()
    .withMessage("expiresAt must be a valid date"),
  body("actionRequired")
    .optional()
    .isString()
    .withMessage("actionRequired must be a string"),
  body("notes")
    .optional()
    .isString()
    .withMessage("notes must be a string"),
];

export default WarningController;
