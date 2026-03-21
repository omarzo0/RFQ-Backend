import { Router } from "express";
import PaymentController, {
  updateSubscriptionValidation,
  processPendingPaymentValidation,
  getTransactionsValidation,
} from "../controllers/PaymentController";
import { authenticateCompanyUser } from "../middleware/companyAuth";
import { standardRateLimit } from "../../middleware/rateLimiter";

const router = Router();
const paymentController = new PaymentController();

// Apply authentication middleware to all routes
router.use(authenticateCompanyUser);
router.use(standardRateLimit);

/**
 * @route GET /api/v1/company/payments/subscription
 * @desc Get current company's subscription details
 * @access Private (Company)
 */
router.get("/subscription", paymentController.getSubscription);

/**
 * @route PUT /api/v1/company/payments/subscription
 * @desc Request subscription plan change (creates pending upgrade with 6-hour payment window)
 * @access Private (Company)
 */
router.put(
  "/subscription",
  updateSubscriptionValidation,
  paymentController.updateSubscription
);

/**
 * @route GET /api/v1/company/payments/subscriptions
 * @desc Get all subscriptions for the company
 * @access Private (Company)
 */
router.get("/subscriptions", paymentController.getCompanySubscriptions);

/**
 * @route GET /api/v1/company/payments/plans
 * @desc Get available subscription plans for upgrade
 * @access Private (Company)
 */
router.get("/plans", paymentController.getAvailablePlans);

/**
 * @route GET /api/v1/company/payments/status
 * @desc Get company's subscription status including trial info
 * @access Private (Company)
 */
router.get("/status", paymentController.getSubscriptionStatus);

/**
 * @route GET /api/v1/company/payments/pending-invoice
 * @desc Get pending payment invoice details (for pending plan upgrade)
 * @access Private (Company)
 */
router.get("/pending-invoice", paymentController.getPendingPaymentInvoice);

router.post(
  "/process-payment",
  processPendingPaymentValidation,
  paymentController.processPendingPlanPayment
);

/**
 * @route POST /api/v1/company/payments/invoice/:id/process
 * @desc Process payment for a specific pending plan upgrade invoice
 * @access Private (Company)
 */
router.post(
  "/invoice/:id/process",
  processPendingPaymentValidation,
  paymentController.processPendingPlanPayment
);

/**
 * @route GET /api/v1/company/payments/transactions
 * @desc Get company's transaction history
 * @access Private (Company)
 */
router.get(
  "/transactions",
  getTransactionsValidation,
  paymentController.getCompanyTransactions
);

/**
 * @route GET /api/v1/company/payments/financial-summary
 * @desc Get company's financial summary
 * @access Private (Company)
 */
router.get("/financial-summary", paymentController.getCompanyFinancialSummary);

export default router;
