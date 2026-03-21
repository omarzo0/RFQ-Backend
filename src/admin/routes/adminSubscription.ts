import { Router } from "express";
import { AdminSubscriptionController } from "../controllers/AdminSubscriptionController";
import {
  authenticateAdmin,
  requireAdminOrSuperAdmin,
} from "../middleware/adminAuth";
import { standardRateLimit, mutationRateLimit } from "../../middleware/rateLimiter";

const router = Router();
const adminSubscriptionController = new AdminSubscriptionController();

// All routes require admin authentication
router.use(authenticateAdmin);

// Subscription read routes
router.get("/", standardRateLimit, adminSubscriptionController.getSubscriptions);
router.get("/analytics", standardRateLimit, adminSubscriptionController.getSubscriptionAnalytics);
router.get("/expiring-trials", standardRateLimit, adminSubscriptionController.getExpiringTrials);
router.get("/:companyId", standardRateLimit, adminSubscriptionController.getSubscription);
router.get(
  "/:companyId/usage",
  standardRateLimit,
  adminSubscriptionController.getSubscriptionUsage
);

// Subscription actions (require admin or super admin)
router.put(
  "/:companyId",
  mutationRateLimit,
  requireAdminOrSuperAdmin,
  adminSubscriptionController.updateSubscription
);
router.post(
  "/:companyId/suspend",
  mutationRateLimit,
  requireAdminOrSuperAdmin,
  adminSubscriptionController.suspendSubscription
);
router.post(
  "/:companyId/reactivate",
  mutationRateLimit,
  requireAdminOrSuperAdmin,
  adminSubscriptionController.reactivateSubscription
);
router.post(
  "/:companyId/cancel",
  mutationRateLimit,
  requireAdminOrSuperAdmin,
  adminSubscriptionController.cancelSubscription
);
router.post(
  "/:companyId/extend-trial",
  mutationRateLimit,
  requireAdminOrSuperAdmin,
  adminSubscriptionController.extendTrial
);

export default router;
