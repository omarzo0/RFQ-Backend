import { Router } from "express";
import PaymentController, {
  createPaymentIntentValidation,
  upgradeSubscriptionValidation,
  updateSubscriptionValidation,
  cancelSubscriptionValidation,
  processRefundValidation,
  getSubscriptionValidation,
  getTransactionsValidation,
} from "../controllers/PaymentController";
import { authenticateCompanyUser } from "../middleware/companyAuth";

const router = Router();
const paymentController = new PaymentController();

// Apply authentication middleware to all routes
router.use(authenticateCompanyUser);

/**
 * @route POST /api/v1/company/payments/intent
 * @desc Create a payment intent for one-time payments
 * @access Private (Company)
 */
router.post(
  "/intent",
  createPaymentIntentValidation,
  paymentController.createPaymentIntent
);

/**
 * @route POST /api/v1/company/payments/upgrade
 * @desc Upgrade subscription from trial to paid plan
 * @access Private (Company)
 */
router.post(
  "/upgrade",
  upgradeSubscriptionValidation,
  paymentController.upgradeSubscription
);

/**
 * @route PUT /api/v1/company/payments/subscription/:subscriptionId
 * @desc Update an existing subscription
 * @access Private (Company)
 */
router.put(
  "/subscription/:subscriptionId",
  updateSubscriptionValidation,
  paymentController.updateSubscription
);

/**
 * @route DELETE /api/v1/company/payments/subscription/:subscriptionId
 * @desc Cancel a subscription
 * @access Private (Company)
 */
router.delete(
  "/subscription/:subscriptionId",
  cancelSubscriptionValidation,
  paymentController.cancelSubscription
);

/**
 * @route GET /api/v1/company/payments/methods
 * @desc Get payment methods for the company
 * @access Private (Company)
 */
router.get("/methods", paymentController.getPaymentMethods);

/**
 * @route POST /api/v1/company/payments/setup-intent
 * @desc Create a setup intent for saving payment methods
 * @access Private (Company)
 */
router.post("/setup-intent", paymentController.createSetupIntent);

/**
 * @route GET /api/v1/company/payments/subscription/:subscriptionId
 * @desc Get subscription details
 * @access Private (Company)
 */
router.get(
  "/subscription/:subscriptionId",
  getSubscriptionValidation,
  paymentController.getSubscription
);

/**
 * @route GET /api/v1/company/payments/subscriptions
 * @desc Get all subscriptions for the company
 * @access Private (Company)
 */
router.get("/subscriptions", paymentController.getCompanySubscriptions);

/**
 * @route POST /api/v1/company/payments/refund/:paymentIntentId
 * @desc Process a refund for a payment intent
 * @access Private (Company)
 */
router.post(
  "/refund/:paymentIntentId",
  processRefundValidation,
  paymentController.processRefund
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

/**
 * @route GET /api/v1/company/payments/plans
 * @desc Get available subscription plans for upgrade
 * @access Private (Company)
 */
router.get("/plans", paymentController.getAvailablePlans);

/**
 * @route GET /api/v1/company/payments/status
 * @desc Get company's subscription status
 * @access Private (Company)
 */
router.get("/status", paymentController.getSubscriptionStatus);

/**
 * @route POST /api/v1/company/payments/webhook
 * @desc Handle Stripe webhooks
 * @access Public (Webhook)
 */
router.post("/webhook", paymentController.handleWebhook);

export default router;
