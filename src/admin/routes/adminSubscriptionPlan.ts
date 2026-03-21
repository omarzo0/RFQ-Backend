import { Router } from "express";
import { AdminSubscriptionPlanController } from "../controllers/AdminSubscriptionPlanController";
import {
  authenticateAdmin,
  requireAdminOrSuperAdmin,
} from "../middleware/adminAuth";
import { standardRateLimit, mutationRateLimit } from "../../middleware/rateLimiter";

const router = Router();
const adminSubscriptionPlanController = new AdminSubscriptionPlanController();

// All routes require admin authentication
router.use(authenticateAdmin);

// Subscription plan read routes
router.get("/", standardRateLimit, adminSubscriptionPlanController.getSubscriptionPlans);

// Feature registry – must come before /:id so it's not treated as an ID
router.get(
  "/feature-registry",
  standardRateLimit,
  adminSubscriptionPlanController.getFeatureRegistry
);

router.get("/:id", standardRateLimit, adminSubscriptionPlanController.getSubscriptionPlan);
router.get(
  "/:id/usage",
  standardRateLimit,
  adminSubscriptionPlanController.getSubscriptionPlanUsage
);

// Subscription plan actions (require admin or super admin)
router.post(
  "/",
  mutationRateLimit,
  requireAdminOrSuperAdmin,
  adminSubscriptionPlanController.createSubscriptionPlan
);
router.put(
  "/:id",
  mutationRateLimit,
  requireAdminOrSuperAdmin,
  adminSubscriptionPlanController.updateSubscriptionPlan
);
router.delete(
  "/:id",
  mutationRateLimit,
  requireAdminOrSuperAdmin,
  adminSubscriptionPlanController.deleteSubscriptionPlan
);
router.patch(
  "/:id/toggle-status",
  mutationRateLimit,
  requireAdminOrSuperAdmin,
  adminSubscriptionPlanController.toggleSubscriptionPlanStatus
);

export default router;
