import { Router } from "express";
import { AdminAnalyticsController } from "../controllers/AdminAnalyticsController";
import {
  authenticateAdmin,
  requireAdminOrSuperAdmin,
} from "../middleware/adminAuth";

const router = Router();
const adminAnalyticsController = new AdminAnalyticsController();

// All routes require admin authentication
router.use(authenticateAdmin);

// Analytics routes
router.get("/company-growth", adminAnalyticsController.getCompanyGrowth);
router.get("/revenue", adminAnalyticsController.getRevenue);
router.get("/user-activity", adminAnalyticsController.getUserActivity);
router.get("/email-performance", adminAnalyticsController.getEmailPerformance);
router.get("/rfq-performance", adminAnalyticsController.getRFQPerformance);
router.get("/quote-performance", adminAnalyticsController.getQuotePerformance);
router.get("/top-companies", adminAnalyticsController.getTopCompanies);
router.get("/system-health", adminAnalyticsController.getSystemHealth);

export default router;
