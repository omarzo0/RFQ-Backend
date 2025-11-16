import { Response } from "express";
import { AuthenticatedRequest } from "../../types/auth";
import { body, param, query, validationResult } from "express-validator";
import PaymentService from "../services/PaymentService";
import logger from "../../utils/logger";
import { successResponse, errorResponse } from "../../utils/response";

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  /**
   * Create a payment intent for one-time payments
   */
  createPaymentIntent = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, "Validation failed", 400, errors.array());
      }

      const { amount, currency, description, metadata } = req.body;
      const companyId = req.user?.companyId;

      if (!companyId) {
        return errorResponse(res, "Company ID not found in request", 400);
      }

      const paymentIntent = await this.paymentService.createPaymentIntent({
        companyId,
        amount,
        currency,
        description,
        metadata,
      });

      return successResponse(
        res,
        {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
        },
        "Payment intent created successfully"
      );
    } catch (error) {
      logger.error("Error creating payment intent:", error);
      return errorResponse(res, "Failed to create payment intent", 500);
    }
  };

  /**
   * Upgrade subscription from trial to paid plan
   */
  upgradeSubscription = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, "Validation failed", 400, errors.array());
      }

      const { priceId, paymentMethodId } = req.body;
      const companyId = req.user?.companyId;

      if (!companyId) {
        return errorResponse(res, "Company ID not found in request", 400);
      }

      const subscription = await this.paymentService.upgradeSubscription({
        companyId,
        priceId,
        paymentMethodId,
      });

      return successResponse(
        res,
        {
          subscriptionId: subscription.id,
          status: subscription.status,
          clientSecret: (subscription.latest_invoice as any)?.payment_intent
            ?.client_secret,
          currentPeriodStart: (subscription as any).current_period_start,
          currentPeriodEnd: (subscription as any).current_period_end,
        },
        "Subscription upgraded successfully"
      );
    } catch (error) {
      logger.error("Error upgrading subscription:", error);
      return errorResponse(
        res,
        (error as Error).message || "Failed to upgrade subscription",
        500
      );
    }
  };

  /**
   * Update current company's subscription (request plan change with 6-hour payment window)
   */
  updateSubscription = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, "Validation failed", 400, errors.array());
      }

      const companyId = req.user?.companyId;

      if (!companyId) {
        return errorResponse(res, "Company ID not found in request", 400);
      }

      const { planId } = req.body;

      if (!planId) {
        return errorResponse(res, "Plan ID is required", 400);
      }

      // Request plan change with 6-hour payment window
      const result = await this.paymentService.requestPlanChange(
        companyId,
        planId
      );

      return successResponse(
        res,
        {
          planId: result.planId,
          planName: result.planName,
          priceMonthly: result.priceMonthly,
          paymentDeadline: result.paymentDeadline,
          hoursRemaining: result.hoursRemaining,
          message: "Plan change requested. Please complete payment within 6 hours.",
        },
        "Subscription update requested successfully"
      );
    } catch (error) {
      logger.error("Error updating subscription:", error);
      return errorResponse(
        res,
        (error as Error).message || "Failed to update subscription",
        500
      );
    }
  };

  /**
   * Cancel current company's subscription
   */
  cancelSubscription = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, "Validation failed", 400, errors.array());
      }

      const companyId = req.user?.companyId;

      if (!companyId) {
        return errorResponse(res, "Company ID not found in request", 400);
      }

      const { immediately } = req.body;

      // Get company's current subscription
      const subscriptions = await this.paymentService.getCompanySubscriptions(
        companyId
      );
      const currentSubscription = subscriptions.find(sub => sub.status === 'active') || subscriptions[0];

      if (!currentSubscription) {
        return errorResponse(res, "No active subscription found for company", 404);
      }

      const subscription = await this.paymentService.cancelSubscription(
        currentSubscription.id,
        immediately || false
      );

      return successResponse(
        res,
        {
          subscriptionId: subscription.id,
          status: subscription.status,
          canceledAt: subscription.canceled_at,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
        "Subscription cancelled successfully"
      );
    } catch (error) {
      logger.error("Error cancelling subscription:", error);
      return errorResponse(res, "Failed to cancel subscription", 500);
    }
  };

  /**
   * Get payment methods for a company
   */
  getPaymentMethods = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        return errorResponse(res, "Company ID not found in request", 400);
      }

      const paymentMethods = await this.paymentService.getPaymentMethods(
        companyId
      );

      return successResponse(
        res,
        {
          paymentMethods,
          count: paymentMethods.length,
        },
        "Payment methods retrieved successfully"
      );
    } catch (error) {
      logger.error("Error retrieving payment methods:", error);
      return errorResponse(res, "Failed to retrieve payment methods", 500);
    }
  };

  /**
   * Create a setup intent for saving payment methods
   */
  createSetupIntent = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        return errorResponse(res, "Company ID not found in request", 400);
      }

      const setupIntent = await this.paymentService.createSetupIntent(
        companyId
      );

      return successResponse(
        res,
        {
          clientSecret: setupIntent.client_secret,
          setupIntentId: setupIntent.id,
          status: setupIntent.status,
        },
        "Setup intent created successfully"
      );
    } catch (error) {
      logger.error("Error creating setup intent:", error);
      return errorResponse(res, "Failed to create setup intent", 500);
    }
  };

  /**
   * Get subscription details for current company
   */
  getSubscription = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        return errorResponse(res, "Company ID not found in request", 400);
      }

      // Get subscription status from database (includes trial subscriptions)
      const subscriptionStatus = await this.paymentService.getCompanySubscriptionStatus(
        companyId
      );

      if (!subscriptionStatus) {
        return errorResponse(res, "No subscription found for company", 404);
      }

      // Try to get Stripe subscription details if exists
      let stripeSubscription = null;
      if (subscriptionStatus.hasStripeCustomer && subscriptionStatus.currentPlan !== 'trial') {
        try {
          const subscriptions = await this.paymentService.getCompanySubscriptions(
            companyId
          );
          stripeSubscription = subscriptions.find(sub => sub.status === 'active') || subscriptions[0];
        } catch (error) {
          logger.warn("Could not fetch Stripe subscription details:", error);
          // Continue without Stripe details
        }
      }

      return successResponse(
        res,
        {
          currentPlan: subscriptionStatus.currentPlan,
          status: subscriptionStatus.status,
          trialEndsAt: subscriptionStatus.trialEndsAt,
          isTrialExpired: subscriptionStatus.isTrialExpired,
          daysLeftInTrial: subscriptionStatus.daysLeftInTrial,
          canUpgrade: subscriptionStatus.canUpgrade,
          hasStripeCustomer: subscriptionStatus.hasStripeCustomer,
          // Include Stripe details if available
          ...(stripeSubscription && {
            stripeSubscription: {
              subscriptionId: stripeSubscription.id,
              status: stripeSubscription.status,
              currentPeriodStart: (stripeSubscription as any).current_period_start,
              currentPeriodEnd: (stripeSubscription as any).current_period_end,
              trialEnd: stripeSubscription.trial_end,
              cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
              canceledAt: stripeSubscription.canceled_at,
              defaultPaymentMethod: stripeSubscription.default_payment_method,
              items: stripeSubscription.items.data,
            }
          })
        },
        "Subscription retrieved successfully"
      );
    } catch (error) {
      logger.error("Error retrieving subscription:", error);
      return errorResponse(res, "Failed to retrieve subscription", 500);
    }
  };

  /**
   * Get company's subscriptions
   */
  getCompanySubscriptions = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        return errorResponse(res, "Company ID not found in request", 400);
      }

      const subscriptions = await this.paymentService.getCompanySubscriptions(
        companyId
      );

      return successResponse(
        res,
        {
          subscriptions: subscriptions.map((sub) => ({
            id: sub.id,
            status: sub.status,
            currentPeriodStart: (sub as any).current_period_start,
            currentPeriodEnd: (sub as any).current_period_end,
            trialEnd: sub.trial_end,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            canceledAt: sub.canceled_at,
            defaultPaymentMethod: sub.default_payment_method,
            items: sub.items.data,
          })),
          count: subscriptions.length,
        },
        "Company subscriptions retrieved successfully"
      );
    } catch (error) {
      logger.error("Error retrieving company subscriptions:", error);
      return errorResponse(
        res,
        "Failed to retrieve company subscriptions",
        500
      );
    }
  };

  /**
   * Process a refund
   */
  processRefund = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, "Validation failed", 400, errors.array());
      }

      const { paymentIntentId } = req.params;
      const { amount, reason } = req.body;

      const refund = await this.paymentService.processRefund(
        paymentIntentId,
        amount,
        reason
      );

      return successResponse(
        res,
        {
          refundId: refund.id,
          amount: refund.amount,
          status: refund.status,
          reason: refund.reason,
        },
        "Refund processed successfully"
      );
    } catch (error) {
      logger.error("Error processing refund:", error);
      return errorResponse(res, "Failed to process refund", 500);
    }
  };

  /**
   * Get company's transaction history
   */
  getCompanyTransactions = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const companyId = req.user?.companyId;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      if (!companyId) {
        return errorResponse(res, "Company ID not found in request", 400);
      }

      const transactions = await this.paymentService.getCompanyTransactions(
        companyId,
        limit,
        offset
      );

      return successResponse(
        res,
        {
          transactions,
          pagination: {
            limit,
            offset,
            count: transactions.length,
          },
        },
        "Company transactions retrieved successfully"
      );
    } catch (error) {
      logger.error("Error retrieving company transactions:", error);
      return errorResponse(res, "Failed to retrieve company transactions", 500);
    }
  };

  /**
   * Get company's financial summary
   */
  getCompanyFinancialSummary = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        return errorResponse(res, "Company ID not found in request", 400);
      }

      const summary = await this.paymentService.getCompanyFinancialSummary(
        companyId
      );

      return successResponse(
        res,
        summary,
        "Financial summary retrieved successfully"
      );
    } catch (error) {
      logger.error("Error retrieving financial summary:", error);
      return errorResponse(res, "Failed to retrieve financial summary", 500);
    }
  };

  /**
   * Handle Stripe webhooks
   */
  handleWebhook = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sig = req.headers["stripe-signature"] as string;
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!endpointSecret) {
        logger.error("STRIPE_WEBHOOK_SECRET not configured");
        return res.status(400).send("Webhook secret not configured");
      }

      let event;

      try {
        event = require("stripe").webhooks.constructEvent(
          req.body,
          sig,
          endpointSecret
        );
      } catch (err: any) {
        logger.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      await this.paymentService.handleWebhook(event);

      res.json({ received: true });
    } catch (error) {
      logger.error("Error handling webhook:", error);
      return res.status(500).json({ error: "Webhook handler failed" });
    }
  };

  /**
   * Get available subscription plans for companies to upgrade to
   */
  getAvailablePlans = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const plans = await this.paymentService.getAvailableSubscriptionPlans();
      return successResponse(res, { plans }, "Available plans retrieved");
    } catch (error) {
      logger.error("Error getting available plans:", error);
      return errorResponse(res, "Failed to get available plans", 500);
    }
  };

  /**
   * Get company subscription status
   */
  getSubscriptionStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        return errorResponse(res, "Company ID not found in request", 400);
      }

      const status = await this.paymentService.getCompanySubscriptionStatus(
        companyId
      );
      return successResponse(res, { status }, "Subscription status retrieved");
    } catch (error) {
      logger.error("Error getting subscription status:", error);
      return errorResponse(res, "Failed to get subscription status", 500);
    }
  };

  /**
   * Complete plan upgrade after payment
   */
  completePlanUpgrade = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        return errorResponse(res, "Company ID not found in request", 400);
      }

      const result = await this.paymentService.completePlanUpgrade(companyId);

      return successResponse(
        res,
        {
          planName: result.planName,
          priceMonthly: result.priceMonthly,
          status: result.status,
        },
        "Plan upgraded successfully"
      );
    } catch (error) {
      logger.error("Error completing plan upgrade:", error);
      return errorResponse(
        res,
        (error as Error).message || "Failed to complete plan upgrade",
        500
      );
    }
  };

  /**
   * Cancel pending plan upgrade
   */
  cancelPendingUpgrade = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        return errorResponse(res, "Company ID not found in request", 400);
      }

      await this.paymentService.cancelPendingPlanUpgrade(companyId);

      return successResponse(
        res,
        null,
        "Pending plan upgrade cancelled successfully"
      );
    } catch (error) {
      logger.error("Error cancelling pending upgrade:", error);
      return errorResponse(res, "Failed to cancel pending upgrade", 500);
    }
  };

  /**
   * Get pending payment invoice
   */
  getPendingPaymentInvoice = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        return errorResponse(res, "Company ID not found in request", 400);
      }

      const invoice = await this.paymentService.getPendingPaymentInvoice(
        companyId
      );

      return successResponse(
        res,
        invoice,
        "Payment invoice retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting payment invoice:", error);
      return errorResponse(
        res,
        (error as Error).message || "Failed to get payment invoice",
        error instanceof Error &&
          error.message === "No pending payment found"
          ? 404
          : 500
      );
    }
  };

  /**
   * Process payment for pending plan upgrade
   */
  processPendingPlanPayment = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, "Validation failed", 400, errors.array());
      }

      const companyId = req.user?.companyId;

      if (!companyId) {
        return errorResponse(res, "Company ID not found in request", 400);
      }

      const { paymentMethodId } = req.body;

      const result = await this.paymentService.processPendingPlanPayment(
        companyId,
        { paymentMethodId }
      );

      return successResponse(
        res,
        result,
        "Payment processed successfully"
      );
    } catch (error) {
      logger.error("Error processing payment:", error);
      return errorResponse(
        res,
        (error as Error).message || "Failed to process payment",
        500
      );
    }
  };
}

// Validation rules
export const createPaymentIntentValidation = [
  body("amount")
    .isNumeric()
    .withMessage("Amount must be a number")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),
  body("currency")
    .isString()
    .withMessage("Currency is required")
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be a 3-letter code"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  body("metadata")
    .optional()
    .isObject()
    .withMessage("Metadata must be an object"),
];

export const upgradeSubscriptionValidation = [
  body("priceId").isString().withMessage("Price ID is required"),
  body("paymentMethodId")
    .optional()
    .isString()
    .withMessage("Payment method ID must be a string"),
];

export const updateSubscriptionValidation = [
  body("planId")
    .isString()
    .withMessage("Plan ID is required and must be a string"),
];

export const cancelSubscriptionValidation = [
  body("immediately")
    .optional()
    .isBoolean()
    .withMessage("Immediately must be a boolean"),
];

export const processRefundValidation = [
  param("paymentIntentId")
    .isString()
    .withMessage("Payment intent ID is required"),
  body("amount")
    .optional()
    .isNumeric()
    .withMessage("Amount must be a number")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),
  body("reason")
    .optional()
    .isIn(["duplicate", "fraudulent", "requested_by_customer"])
    .withMessage("Invalid refund reason"),
];

export const getTransactionsValidation = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Offset must be a non-negative integer"),
];

export const processPendingPaymentValidation = [
  body("paymentMethodId")
    .isString()
    .withMessage("Payment method ID is required"),
];

export default PaymentController;
