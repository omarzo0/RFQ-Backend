import { Router } from "express";
import { AdminDashboardController } from "../controllers/AdminDashboardController";
import {
  authenticateAdmin,
  requireAdminOrSuperAdmin,
} from "../middleware/adminAuth";
import {
  standardRateLimit,
  analyticsRateLimit,
} from "../../middleware/rateLimiter";

const router = Router();
const controller = new AdminDashboardController();

// All routes require admin authentication
router.use(authenticateAdmin);

// ─── Dashboard Overview ────────────────────────────────────────────────
router.get("/", standardRateLimit, controller.getDashboard);
router.get("/comprehensive", standardRateLimit, controller.getComprehensiveDashboard);

// ─── Company & Data Management ─────────────────────────────────────────
router.get("/companies/:companyId/details", standardRateLimit, controller.getCompanyDetails);
router.get("/rfqs", standardRateLimit, requireAdminOrSuperAdmin, controller.getAllRFQs);
router.get("/quotes", standardRateLimit, requireAdminOrSuperAdmin, controller.getAllQuotes);
router.get("/contacts", standardRateLimit, requireAdminOrSuperAdmin, controller.getAllContacts);
router.get("/shipping-lines", standardRateLimit, requireAdminOrSuperAdmin, controller.getAllShippingLines);
router.get("/emails", standardRateLimit, requireAdminOrSuperAdmin, controller.getAllEmailLogs);

// ─── Management Overviews ──────────────────────────────────────────────
router.get("/admin-management", standardRateLimit, requireAdminOrSuperAdmin, controller.getAdminManagementOverview);
router.get("/company-management", standardRateLimit, controller.getCompanyManagementOverview);
router.get("/ticket-management", standardRateLimit, controller.getTicketManagementOverview);
router.get("/system-features", standardRateLimit, controller.getSystemFeaturesOverview);

// ─── Subscriptions ─────────────────────────────────────────────────────
router.get("/subscriptions", standardRateLimit, controller.getSubscriptionOverview);

// ─── Dashboard Analytics ───────────────────────────────────────────────
router.get("/analytics", analyticsRateLimit, controller.getAnalyticsOverview);
router.get("/analytics/subscriptions", analyticsRateLimit, controller.getSubscriptionAnalytics);
router.get("/analytics/emails", analyticsRateLimit, controller.getEmailAnalytics);
router.get("/analytics/rfqs", analyticsRateLimit, controller.getRFQAnalytics);
router.get("/analytics/quotes", analyticsRateLimit, controller.getQuoteAnalytics);

// ─── System Health & Activity ──────────────────────────────────────────
router.get("/recent-activity", standardRateLimit, controller.getRecentActivity);
router.get("/system-health", standardRateLimit, controller.getSystemHealth);

export default router;
