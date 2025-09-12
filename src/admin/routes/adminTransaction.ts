import { Router } from "express";
import { AdminTransactionController } from "../controllers/AdminTransactionController";
import {
  authenticateAdmin,
  requireAdminOrSuperAdmin,
} from "../middleware/adminAuth";

const router = Router();
const adminTransactionController = new AdminTransactionController();

// Apply authentication middleware to all routes
router.use(authenticateAdmin);

/**
 * @route GET /api/v1/admin/transactions
 * @desc Get all transactions with filtering and pagination
 * @access Admin, SuperAdmin
 */
router.get(
  "/",
  requireAdminOrSuperAdmin,
  adminTransactionController.getTransactions
);

/**
 * @route GET /api/v1/admin/transactions/analytics
 * @desc Get transaction analytics
 * @access Admin, SuperAdmin
 */
router.get(
  "/analytics",
  requireAdminOrSuperAdmin,
  adminTransactionController.getTransactionAnalytics
);

/**
 * @route GET /api/v1/admin/transactions/company/:companyId
 * @desc Get transactions by company
 * @access Admin, SuperAdmin
 */
router.get(
  "/company/:companyId",
  requireAdminOrSuperAdmin,
  adminTransactionController.getTransactionsByCompany
);

/**
 * @route GET /api/v1/admin/transactions/:id
 * @desc Get transaction by ID
 * @access Admin, SuperAdmin
 */
router.get(
  "/:id",
  requireAdminOrSuperAdmin,
  adminTransactionController.getTransaction
);

/**
 * @route POST /api/v1/admin/transactions
 * @desc Create new transaction
 * @access Admin, SuperAdmin
 */
router.post(
  "/",
  requireAdminOrSuperAdmin,
  adminTransactionController.createTransaction
);

/**
 * @route PUT /api/v1/admin/transactions/:id
 * @desc Update transaction
 * @access Admin, SuperAdmin
 */
router.put(
  "/:id",
  requireAdminOrSuperAdmin,
  adminTransactionController.updateTransaction
);

/**
 * @route DELETE /api/v1/admin/transactions/:id
 * @desc Delete transaction
 * @access Admin, SuperAdmin
 */
router.delete(
  "/:id",
  requireAdminOrSuperAdmin,
  adminTransactionController.deleteTransaction
);

/**
 * @route PATCH /api/v1/admin/transactions/:id/status
 * @desc Update transaction status
 * @access Admin, SuperAdmin
 */
router.patch(
  "/:id/status",
  requireAdminOrSuperAdmin,
  adminTransactionController.updateTransactionStatus
);

/**
 * @route POST /api/v1/admin/transactions/:id/refund
 * @desc Process refund for transaction
 * @access Admin, SuperAdmin
 */
router.post(
  "/:id/refund",
  requireAdminOrSuperAdmin,
  adminTransactionController.processRefund
);

export default router;
