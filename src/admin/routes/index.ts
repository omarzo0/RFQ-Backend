import { Router } from "express";
import adminAuthRoutes from "./adminAuth";
import adminCompanyRoutes from "./adminCompany";
import adminDashboardRoutes from "./adminDashboard";
import adminAnalyticsRoutes from "./adminAnalytics";
import adminSubscriptionRoutes from "./adminSubscription";
import adminManagementRoutes from "./adminManagement";
import adminTicketsRoutes from "./adminTickets";
import adminSystemFeaturesRoutes from "./adminSystemFeatures";
import adminComprehensiveDashboardRoutes from "./adminComprehensiveDashboard";
import authRoutes from "./auth";

const router = Router();

// Admin authentication routes
router.use("/auth", adminAuthRoutes);
router.use("/auth", authRoutes);

// Admin dashboard routes
router.use("/dashboard", adminDashboardRoutes);

// Comprehensive admin dashboard routes
router.use("/dashboard", adminComprehensiveDashboardRoutes);

// Admin analytics routes
router.use("/analytics", adminAnalyticsRoutes);

// Admin subscription management routes
router.use("/subscriptions", adminSubscriptionRoutes);

// Admin management routes (super admin only)
router.use("/management", adminManagementRoutes);

// Admin ticket management routes
router.use("/tickets", adminTicketsRoutes);

// Admin system features management routes
router.use("/system-features", adminSystemFeaturesRoutes);

// Admin company management routes
router.use("/companies", adminCompanyRoutes);

export default router;
