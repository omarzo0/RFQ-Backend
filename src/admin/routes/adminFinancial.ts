import { Router } from "express";
import { AdminFinancialController } from "../controllers/AdminFinancialController";
import {
  authenticateAdmin,
  requireAdminOrSuperAdmin,
} from "../middleware/adminAuth";

const router = Router();
const adminFinancialController = new AdminFinancialController();

// Apply authentication middleware to all routes
router.use(authenticateAdmin);

/**
 * @route GET /api/v1/admin/financial
 * @desc Get all financial details with filtering and pagination
 * @access Admin, SuperAdmin
 */
router.get(
  "/",
  requireAdminOrSuperAdmin,
  adminFinancialController.getFinancialDetails
);

/**
 * @route GET /api/v1/admin/financial/dashboard
 * @desc Get financial dashboard data
 * @access Admin, SuperAdmin
 */
router.get(
  "/dashboard",
  requireAdminOrSuperAdmin,
  adminFinancialController.getFinancialDashboard
);

/**
 * @route GET /api/v1/admin/financial/analytics
 * @desc Get financial analytics and overview
 * @access Admin, SuperAdmin
 */
router.get(
  "/analytics",
  requireAdminOrSuperAdmin,
  adminFinancialController.getFinancialAnalytics
);

/**
 * @route GET /api/v1/admin/financial/revenue-trends
 * @desc Get revenue trends
 * @access Admin, SuperAdmin
 */
router.get(
  "/revenue-trends",
  requireAdminOrSuperAdmin,
  adminFinancialController.getRevenueTrends
);

/**
 * @route GET /api/v1/admin/financial/top-companies
 * @desc Get top performing companies
 * @access Admin, SuperAdmin
 */
router.get(
  "/top-companies",
  requireAdminOrSuperAdmin,
  adminFinancialController.getTopPerformingCompanies
);

/**
 * @route GET /api/v1/admin/financial/health
 * @desc Get financial health metrics
 * @access Admin, SuperAdmin
 */
router.get(
  "/health",
  requireAdminOrSuperAdmin,
  adminFinancialController.getFinancialHealth
);

/**
 * @route GET /api/v1/admin/financial/company/:companyId
 * @desc Get financial details by company ID
 * @access Admin, SuperAdmin
 */
router.get(
  "/company/:companyId",
  requireAdminOrSuperAdmin,
  adminFinancialController.getFinancialDetailsByCompany
);

/**
 * @route PUT /api/v1/admin/financial/company/:companyId
 * @desc Update financial details for a company
 * @access Admin, SuperAdmin
 */
router.put(
  "/company/:companyId",
  requireAdminOrSuperAdmin,
  adminFinancialController.updateFinancialDetails
);

/**
 * @route POST /api/v1/admin/financial/company/:companyId/recalculate
 * @desc Recalculate financial details for a company
 * @access Admin, SuperAdmin
 */
router.post(
  "/company/:companyId/recalculate",
  requireAdminOrSuperAdmin,
  adminFinancialController.recalculateFinancialDetails
);

export default router;
