import { Router } from "express";
import adminAuthRoutes from "./adminAuth";
import adminCompanyRoutes from "./adminCompany";
import adminDashboardRoutes from "./adminDashboard";
import adminAnalyticsRoutes from "./adminAnalytics";
import adminSubscriptionRoutes from "./adminSubscription";
import adminManagementRoutes from "./adminManagement";
import adminTicketsRoutes from "./adminTickets";
import adminSubscriptionPlanRoutes from "./adminSubscriptionPlan";
import adminTransactionRoutes from "./adminTransaction";
import adminFinancialRoutes from "./adminFinancial";
import notificationRoutes from "./notifications";
import warningRoutes from "./warnings";

const router = Router();

// Admin authentication routes
router.use("/auth", adminAuthRoutes);

// Admin dashboard routes
router.use("/dashboard", adminDashboardRoutes);

// Admin analytics routes
router.use("/analytics", adminAnalyticsRoutes);

// Admin subscription management routes
router.use("/subscriptions", adminSubscriptionRoutes);

// Admin subscription plan management routes
router.use("/subscription-plans", adminSubscriptionPlanRoutes);

// Admin transaction management routes
router.use("/transactions", adminTransactionRoutes);

// Admin financial management routes
router.use("/financial", adminFinancialRoutes);

// Admin management routes (super admin only)
router.use("/management", adminManagementRoutes);

// Admin ticket management routes
router.use("/tickets", adminTicketsRoutes);

// Admin notification routes
router.use("/notifications", notificationRoutes);

// Admin warning routes
router.use("/warnings", warningRoutes);

// Admin system features management routes

// Admin company management routes
router.use("/companies", adminCompanyRoutes);

export default router;
