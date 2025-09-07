import { Router } from "express";
import { AdminComprehensiveDashboardController } from "../controllers/AdminComprehensiveDashboardController";
import {
  authenticateAdmin,
  requireAdminOrSuperAdmin,
} from "../middleware/adminAuth";

const router = Router();
const adminComprehensiveDashboardController =
  new AdminComprehensiveDashboardController();

// All routes require admin authentication
router.use(authenticateAdmin);

// Comprehensive dashboard routes
router.get(
  "/comprehensive",
  adminComprehensiveDashboardController.getComprehensiveDashboard
);
router.get(
  "/admin-management",
  requireAdminOrSuperAdmin,
  adminComprehensiveDashboardController.getAdminManagementOverview
);
router.get(
  "/company-management",
  adminComprehensiveDashboardController.getCompanyManagementOverview
);
router.get(
  "/ticket-management",
  adminComprehensiveDashboardController.getTicketManagementOverview
);
router.get(
  "/system-features",
  adminComprehensiveDashboardController.getSystemFeaturesOverview
);
router.get(
  "/analytics",
  adminComprehensiveDashboardController.getAnalyticsOverview
);
router.get(
  "/subscriptions",
  adminComprehensiveDashboardController.getSubscriptionOverview
);
router.get(
  "/recent-activity",
  adminComprehensiveDashboardController.getRecentActivity
);
router.get(
  "/system-health",
  adminComprehensiveDashboardController.getSystemHealth
);

export default router;
