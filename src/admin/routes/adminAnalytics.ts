import { Router } from "express";
import { AdminDashboardController } from "../controllers/AdminDashboardController";
import { authenticateAdmin } from "../middleware/adminAuth";

const router = Router();
const controller = new AdminDashboardController();

// All routes require admin authentication
router.use(authenticateAdmin);

// ─── Detailed Analytics ────────────────────────────────────────────────
router.get("/company-growth", controller.getCompanyGrowth);
router.get("/revenue", controller.getRevenue);
router.get("/user-activity", controller.getUserActivity);
router.get("/email-performance", controller.getEmailPerformance);
router.get("/rfq-performance", controller.getRFQPerformance);
router.get("/quote-performance", controller.getQuotePerformance);
router.get("/top-companies", controller.getTopCompanies);
router.get("/system-health", controller.getSystemHealth);

export default router;
