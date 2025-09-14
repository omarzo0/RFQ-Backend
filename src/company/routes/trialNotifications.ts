import { Router } from "express";
import TrialNotificationController from "../controllers/TrialNotificationController";
import { authenticateCompanyUser } from "../middleware/companyAuth";

const router = Router();
const trialNotificationController = new TrialNotificationController();

// Apply authentication middleware to all routes
router.use(authenticateCompanyUser);

/**
 * @route GET /api/v1/company/trial-notifications/check-warnings
 * @desc Manually check for trials ending in 3 days and send warning emails
 * @access Private (Company)
 */
router.get("/check-warnings", trialNotificationController.checkTrialWarnings);

/**
 * @route GET /api/v1/company/trial-notifications/check-expired
 * @desc Manually check for expired trials and send notification emails
 * @access Private (Company)
 */
router.get("/check-expired", trialNotificationController.checkExpiredTrials);

/**
 * @route GET /api/v1/company/trial-notifications/run-all
 * @desc Manually run all trial notification checks
 * @access Private (Company)
 */
router.get("/run-all", trialNotificationController.runAllChecks);

export default router;
