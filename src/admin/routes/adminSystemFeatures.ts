import { Router } from "express";
import { AdminSystemFeaturesController } from "../controllers/AdminSystemFeaturesController";
import { authenticateAdmin, requireSuperAdmin } from "../middleware/adminAuth";

const router = Router();
const adminSystemFeaturesController = new AdminSystemFeaturesController();

// All routes require admin authentication
router.use(authenticateAdmin);

// System features management routes (super admin only)
router.post(
  "/",
  requireSuperAdmin,
  adminSystemFeaturesController.createFeature
);
router.get("/", adminSystemFeaturesController.getFeatures);
router.get("/statistics", adminSystemFeaturesController.getFeatureStatistics);
router.get(
  "/category/:category",
  adminSystemFeaturesController.getFeaturesByCategory
);
router.get(
  "/company/:companyId/dashboard",
  adminSystemFeaturesController.getCompanyDashboardFeatures
);
router.post(
  "/:featureId/company/:companyId/toggle",
  requireSuperAdmin,
  adminSystemFeaturesController.toggleCompanyFeature
);
router.post(
  "/initialize",
  requireSuperAdmin,
  adminSystemFeaturesController.initializeDefaultFeatures
);
router.get("/:id", adminSystemFeaturesController.getFeatureById);
router.put(
  "/:id",
  requireSuperAdmin,
  adminSystemFeaturesController.updateFeature
);
router.delete(
  "/:id",
  requireSuperAdmin,
  adminSystemFeaturesController.deleteFeature
);

export default router;
