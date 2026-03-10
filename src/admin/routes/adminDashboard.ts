import { Router } from "express";
import { AdminDashboardController } from "../controllers/AdminDashboardController";
import {
  authenticateAdmin,
  requireAdminOrSuperAdmin,
} from "../middleware/adminAuth";

const router = Router();
const controller = new AdminDashboardController();

// All routes require admin authentication
router.use(authenticateAdmin);

// ─── Dashboard Overview ────────────────────────────────────────────────
router.get("/", controller.getDashboard);
router.get("/comprehensive", controller.getComprehensiveDashboard);

// ─── Company & Data Management ─────────────────────────────────────────
router.get("/companies/:companyId/details", controller.getCompanyDetails);
router.get("/rfqs", requireAdminOrSuperAdmin, controller.getAllRFQs);
router.get("/quotes", requireAdminOrSuperAdmin, controller.getAllQuotes);
router.get("/contacts", requireAdminOrSuperAdmin, controller.getAllContacts);
router.get("/shipping-lines", requireAdminOrSuperAdmin, controller.getAllShippingLines);
router.get("/emails", requireAdminOrSuperAdmin, controller.getAllEmailLogs);

// ─── Management Overviews ──────────────────────────────────────────────
router.get("/admin-management", requireAdminOrSuperAdmin, controller.getAdminManagementOverview);
router.get("/company-management", controller.getCompanyManagementOverview);
router.get("/ticket-management", controller.getTicketManagementOverview);
router.get("/system-features", controller.getSystemFeaturesOverview);

// ─── Subscriptions ─────────────────────────────────────────────────────
router.get("/subscriptions", controller.getSubscriptionOverview);

// ─── Dashboard Analytics ───────────────────────────────────────────────
router.get("/analytics", controller.getAnalyticsOverview);
router.get("/analytics/subscriptions", controller.getSubscriptionAnalytics);
router.get("/analytics/emails", controller.getEmailAnalytics);
router.get("/analytics/rfqs", controller.getRFQAnalytics);
router.get("/analytics/quotes", controller.getQuoteAnalytics);

// ─── System Health & Activity ──────────────────────────────────────────
router.get("/recent-activity", controller.getRecentActivity);
router.get("/system-health", controller.getSystemHealth);

export default router;
