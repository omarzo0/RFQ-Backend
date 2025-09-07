import { Router } from "express";
import { AdminSubscriptionController } from "../controllers/AdminSubscriptionController";
import {
  authenticateAdmin,
  requireAdminOrSuperAdmin,
} from "../middleware/adminAuth";

const router = Router();
const adminSubscriptionController = new AdminSubscriptionController();

// All routes require admin authentication
router.use(authenticateAdmin);

// Subscription management routes
router.get("/", adminSubscriptionController.getSubscriptions);
router.get("/analytics", adminSubscriptionController.getSubscriptionAnalytics);
router.get("/expiring-trials", adminSubscriptionController.getExpiringTrials);
router.get("/:companyId", adminSubscriptionController.getSubscription);
router.get(
  "/:companyId/usage",
  adminSubscriptionController.getSubscriptionUsage
);

// Subscription actions (require admin or super admin)
router.put(
  "/:companyId",
  requireAdminOrSuperAdmin,
  adminSubscriptionController.updateSubscription
);
router.post(
  "/:companyId/suspend",
  requireAdminOrSuperAdmin,
  adminSubscriptionController.suspendSubscription
);
router.post(
  "/:companyId/reactivate",
  requireAdminOrSuperAdmin,
  adminSubscriptionController.reactivateSubscription
);
router.post(
  "/:companyId/cancel",
  requireAdminOrSuperAdmin,
  adminSubscriptionController.cancelSubscription
);
router.post(
  "/:companyId/extend-trial",
  requireAdminOrSuperAdmin,
  adminSubscriptionController.extendTrial
);

export default router;
