import { Router } from "express";
import { AdminTransactionController } from "../controllers/AdminTransactionController";
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
const adminTransactionController = new AdminTransactionController();

// Apply authentication middleware to all routes
router.use(authenticateAdmin);

/**
 * @route GET /api/v1/admin/transactions
 * @desc Get all transactions with filtering and pagination
 */
router.get(
  "/",
  standardRateLimit,
  requireAdminOrSuperAdmin,
  adminTransactionController.getTransactions
);

/**
 * @route GET /api/v1/admin/transactions/analytics
 * @desc Get transaction analytics
 */
router.get(
  "/analytics",
  analyticsRateLimit,
  requireAdminOrSuperAdmin,
  adminTransactionController.getTransactionAnalytics
);

/**
 * @route GET /api/v1/admin/transactions/company/:companyId
 * @desc Get transactions by company
 */
router.get(
  "/company/:companyId",
  standardRateLimit,
  requireAdminOrSuperAdmin,
  adminTransactionController.getTransactionsByCompany
);

/**
 * @route GET /api/v1/admin/transactions/:id
 * @desc Get transaction by ID
 */
router.get(
  "/:id",
  standardRateLimit,
  requireAdminOrSuperAdmin,
  adminTransactionController.getTransaction
);

/**
 * @route POST /api/v1/admin/transactions
 * @desc Create new transaction
 */
router.post(
  "/",
  mutationRateLimit,
  requireAdminOrSuperAdmin,
  adminTransactionController.createTransaction
);

/**
 * @route PUT /api/v1/admin/transactions/:id
 * @desc Update transaction
 */
router.put(
  "/:id",
  mutationRateLimit,
  requireAdminOrSuperAdmin,
  adminTransactionController.updateTransaction
);

/**
 * @route DELETE /api/v1/admin/transactions/:id
 * @desc Delete transaction
 */
router.delete(
  "/:id",
  mutationRateLimit,
  requireAdminOrSuperAdmin,
  adminTransactionController.deleteTransaction
);

/**
 * @route PATCH /api/v1/admin/transactions/:id/status
 * @desc Update transaction status
 */
router.patch(
  "/:id/status",
  mutationRateLimit,
  requireAdminOrSuperAdmin,
  adminTransactionController.updateTransactionStatus
);

/**
 * @route POST /api/v1/admin/transactions/:id/refund
 * @desc Process refund for transaction
 */
router.post(
  "/:id/refund",
  mutationRateLimit,
  requireAdminOrSuperAdmin,
  adminTransactionController.processRefund
);

export default router;
