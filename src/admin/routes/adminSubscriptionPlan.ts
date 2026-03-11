import { Router } from "express";
import { AdminSubscriptionPlanController } from "../controllers/AdminSubscriptionPlanController";
import {
  authenticateAdmin,
  requireAdminOrSuperAdmin,
} from "../middleware/adminAuth";

const router = Router();
const adminSubscriptionPlanController = new AdminSubscriptionPlanController();

// All routes require admin authentication
router.use(authenticateAdmin);

// Subscription plan management routes
router.get("/", adminSubscriptionPlanController.getSubscriptionPlans);

// Feature registry – must come before /:id so it's not treated as an ID
router.get(
  "/feature-registry",
  adminSubscriptionPlanController.getFeatureRegistry
);

router.get("/:id", adminSubscriptionPlanController.getSubscriptionPlan);
router.get(
  "/:id/usage",
  adminSubscriptionPlanController.getSubscriptionPlanUsage
);

// Subscription plan actions (require admin or super admin)
router.post(
  "/",
  requireAdminOrSuperAdmin,
  adminSubscriptionPlanController.createSubscriptionPlan
);
router.put(
  "/:id",
  requireAdminOrSuperAdmin,
  adminSubscriptionPlanController.updateSubscriptionPlan
);
router.delete(
  "/:id",
  requireAdminOrSuperAdmin,
  adminSubscriptionPlanController.deleteSubscriptionPlan
);
router.patch(
  "/:id/toggle-status",
  requireAdminOrSuperAdmin,
  adminSubscriptionPlanController.toggleSubscriptionPlanStatus
);

export default router;
