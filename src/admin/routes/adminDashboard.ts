import { Router } from "express";
import { AdminDashboardController } from "../controllers/AdminDashboardController";
import {
  authenticateAdmin,
  requireAdminOrSuperAdmin,
} from "../middleware/adminAuth";

const router = Router();
const adminDashboardController = new AdminDashboardController();

// All routes require admin authentication
router.use(authenticateAdmin);

// Dashboard overview
router.get("/", adminDashboardController.getDashboard);

// Company details
router.get(
  "/companies/:companyId/details",
  adminDashboardController.getCompanyDetails
);

// Data management routes
router.get(
  "/rfqs",
  requireAdminOrSuperAdmin,
  adminDashboardController.getAllRFQs
);
router.get(
  "/quotes",
  requireAdminOrSuperAdmin,
  adminDashboardController.getAllQuotes
);
router.get(
  "/contacts",
  requireAdminOrSuperAdmin,
  adminDashboardController.getAllContacts
);
router.get(
  "/shipping-lines",
  requireAdminOrSuperAdmin,
  adminDashboardController.getAllShippingLines
);
router.get(
  "/emails",
  requireAdminOrSuperAdmin,
  adminDashboardController.getAllEmailLogs
);

// Analytics routes
router.get(
  "/analytics/subscriptions",
  adminDashboardController.getSubscriptionAnalytics
);
router.get("/analytics/emails", adminDashboardController.getEmailAnalytics);
router.get("/analytics/rfqs", adminDashboardController.getRFQAnalytics);
router.get("/analytics/quotes", adminDashboardController.getQuoteAnalytics);

export default router;
