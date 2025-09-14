import { Request, Response } from "express";
import TrialNotificationJob from "../jobs/TrialNotificationJob";
import { successResponse, errorResponse } from "../../utils/response";
import logger from "../../utils/logger";

export class TrialNotificationController {
  private trialNotificationJob: TrialNotificationJob;

  constructor() {
    this.trialNotificationJob = new TrialNotificationJob();
  }

  /**
   * Manually trigger trial ending warning check
   * GET /api/v1/company/trial-notifications/check-warnings
   */
  checkTrialWarnings = async (req: Request, res: Response) => {
    try {
      await this.trialNotificationJob.checkTrialEndingWarning();

      return successResponse(
        res,
        { message: "Trial warning check completed" },
        "Trial warning check executed successfully"
      );
    } catch (error) {
      logger.error("Error checking trial warnings:", error);
      return errorResponse(res, "Failed to check trial warnings", 500);
    }
  };

  /**
   * Manually trigger trial expired check
   * GET /api/v1/company/trial-notifications/check-expired
   */
  checkExpiredTrials = async (req: Request, res: Response) => {
    try {
      await this.trialNotificationJob.checkTrialExpired();

      return successResponse(
        res,
        { message: "Trial expired check completed" },
        "Trial expired check executed successfully"
      );
    } catch (error) {
      logger.error("Error checking expired trials:", error);
      return errorResponse(res, "Failed to check expired trials", 500);
    }
  };

  /**
   * Manually trigger all trial notification checks
   * GET /api/v1/company/trial-notifications/run-all
   */
  runAllChecks = async (req: Request, res: Response) => {
    try {
      await this.trialNotificationJob.runAllChecks();

      return successResponse(
        res,
        { message: "All trial notification checks completed" },
        "All trial notification checks executed successfully"
      );
    } catch (error) {
      logger.error("Error running all trial checks:", error);
      return errorResponse(res, "Failed to run trial checks", 500);
    }
  };
}

export default TrialNotificationController;
