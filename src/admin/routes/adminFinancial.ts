import { Router } from "express";
import { AdminFinancialController } from "../controllers/AdminFinancialController";
import {
  authenticateAdmin,
  requireAdminOrSuperAdmin,
} from "../middleware/adminAuth";
import {
  standardRateLimit,
  analyticsRateLimit,
  mutationRateLimit,
} from "../../middleware/rateLimiter";

const router = Router();
const adminFinancialController = new AdminFinancialController();

// Apply authentication middleware to all routes
router.use(authenticateAdmin);

/**
 * @route GET /api/v1/admin/financial
 * @desc Get all financial details with filtering and pagination
 */
router.get(
  "/",
  standardRateLimit,
  requireAdminOrSuperAdmin,
  adminFinancialController.getFinancialDetails
);

/**
 * @route GET /api/v1/admin/financial/dashboard
 * @desc Get financial dashboard data
 */
router.get(
  "/dashboard",
  analyticsRateLimit,
  requireAdminOrSuperAdmin,
  adminFinancialController.getFinancialDashboard
);

/**
 * @route GET /api/v1/admin/financial/analytics
 * @desc Get financial analytics and overview
 */
router.get(
  "/analytics",
  analyticsRateLimit,
  requireAdminOrSuperAdmin,
  adminFinancialController.getFinancialAnalytics
);

/**
 * @route GET /api/v1/admin/financial/revenue-trends
 * @desc Get revenue trends
 */
router.get(
  "/revenue-trends",
  analyticsRateLimit,
  requireAdminOrSuperAdmin,
  adminFinancialController.getRevenueTrends
);

/**
 * @route GET /api/v1/admin/financial/top-companies
 * @desc Get top performing companies
 */
router.get(
  "/top-companies",
  analyticsRateLimit,
  requireAdminOrSuperAdmin,
  adminFinancialController.getTopPerformingCompanies
);

/**
 * @route GET /api/v1/admin/financial/health
 * @desc Get financial health metrics
 */
router.get(
  "/health",
  standardRateLimit,
  requireAdminOrSuperAdmin,
  adminFinancialController.getFinancialHealth
);

/**
 * @route GET /api/v1/admin/financial/company/:companyId
 * @desc Get financial details by company ID
 */
router.get(
  "/company/:companyId",
  standardRateLimit,
  requireAdminOrSuperAdmin,
  adminFinancialController.getFinancialDetailsByCompany
);

/**
 * @route PUT /api/v1/admin/financial/company/:companyId
 * @desc Update financial details for a company
 */
router.put(
  "/company/:companyId",
  mutationRateLimit,
  requireAdminOrSuperAdmin,
  adminFinancialController.updateFinancialDetails
);

/**
 * @route POST /api/v1/admin/financial/company/:companyId/recalculate
 * @desc Recalculate financial details for a company
 */
router.post(
  "/company/:companyId/recalculate",
  mutationRateLimit,
  requireAdminOrSuperAdmin,
  adminFinancialController.recalculateFinancialDetails
);

export default router;
