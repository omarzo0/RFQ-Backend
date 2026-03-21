import Stripe from "stripe";
import { prisma } from "../../app";
import logger from "../../utils/logger";
import PaymentEmailService from "./PaymentEmailService";

export interface CreatePaymentIntentRequest {
  companyId: string;
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface CreateSubscriptionRequest {
  companyId: string;
  priceId: string;
  paymentMethodId?: string;
  trialPeriodDays?: number;
}

export interface UpdateSubscriptionRequest {
  subscriptionId: string;
  priceId?: string;
  quantity?: number;
  prorationBehavior?: "create_prorations" | "none" | "always_invoice";
}

export interface PaymentMethodData {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  billing_details: {
    email?: string;
    name?: string;
    address?: any;
  };
}

export class PaymentService {
  private stripe: Stripe | null = null;
  private paymentEmailService: PaymentEmailService;
  private isStripeEnabled: boolean = false;
  private getStripe(): Stripe {
    if (!this.stripe) {
      throw new Error(
        "Stripe is not configured. Please check your STRIPE_SECRET_KEY environment variable."
      );
    }
    return this.stripe;
  }
  constructor() {
    // Check if Stripe is configured
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    this.isStripeEnabled = !!stripeKey && stripeKey !== "sk_test_your-stripe-secret-key";

    if (stripeKey) {
      this.stripe = new Stripe(stripeKey, {
        apiVersion: "2025-08-27.basil",
      });

      if (stripeKey === "sk_test_your-stripe-secret-key") {
        logger.warn(
          "STRIPE_SECRET_KEY is the default placeholder. Payment features will run in MOCK MODE."
        );
      } else {
        logger.info("Stripe payment service initialized");
      }
    } else {
      logger.warn(
        "STRIPE_SECRET_KEY not found. Payment features will be disabled."
      );
    }

    this.paymentEmailService = new PaymentEmailService();
  }

  /**
   * Check if we are in mock mode
   */
  private isMockMode(): boolean {
    return process.env.STRIPE_SECRET_KEY === "sk_test_your-stripe-secret-key" || !this.isStripeEnabled;
  }

  /**
   * Get or create Stripe customer for company
   */
  private async getOrCreateCustomer(
    companyId: string
  ): Promise<Stripe.Customer> {
    try {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { stripeCustomerId: true, name: true, email: true },
      });

      if (!company) {
        throw new Error("Company not found");
      }

      // If we're in mock mode, return a mock customer
      if (this.isMockMode()) {
        const mockCustomer = {
          id: company.stripeCustomerId || `cus_mock_${companyId.substring(0, 8)}`,
          object: "customer",
          name: company.name,
          email: company.email,
          metadata: { companyId: companyId },
        } as any;

        if (!company.stripeCustomerId) {
          await prisma.company.update({
            where: { id: companyId },
            data: { stripeCustomerId: mockCustomer.id },
          });
        }
        return mockCustomer;
      }

      if (company.stripeCustomerId) {
        try {
          // Try to retrieve existing customer
          const customer = await this.getStripe().customers.retrieve(
            company.stripeCustomerId
          );

          // Check if customer was deleted
          if (customer.deleted) {
            logger.warn(
              `Stripe customer ${company.stripeCustomerId} was deleted. Creating new customer.`
            );
          } else {
            return customer as Stripe.Customer;
          }
        } catch (error: any) {
          // If customer doesn't exist in Stripe, create a new one
          if (error.code === "resource_missing") {
            logger.warn(
              `Stripe customer ${company.stripeCustomerId} not found. Creating new customer.`
            );
          } else {
            throw error;
          }
        }
      }

      // Create new customer
      const customer = await this.getStripe().customers.create({
        name: company.name,
        email: company.email,
        metadata: {
          companyId: companyId,
        },
      });

      // Update company with new Stripe customer ID
      await prisma.company.update({
        where: { id: companyId },
        data: { stripeCustomerId: customer.id },
      });

      logger.info(
        `Created Stripe customer for company ${companyId}: ${customer.id}`
      );
      return customer;
    } catch (error) {
      logger.error("Error creating/retrieving Stripe customer:", error);
      throw error;
    }
  }

  /**
   * Create a payment intent for one-time payments
   */
  async createPaymentIntent(
    data: CreatePaymentIntentRequest
  ): Promise<Stripe.PaymentIntent> {
    try {
      const customer = await this.getOrCreateCustomer(data.companyId);

      const paymentIntent = await this.getStripe().paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency,
        customer: customer.id,
        description: data.description,
        metadata: {
          companyId: data.companyId,
          ...data.metadata,
        },
      });

      logger.info(
        `Created payment intent for company ${data.companyId}: ${paymentIntent.id}`
      );
      return paymentIntent;
    } catch (error) {
      logger.error("Error creating payment intent:", error);
      throw error;
    }
  }

  /**
   * Upgrade company subscription to a paid plan
   * Companies can only upgrade from trial, not create new subscriptions
   */
  async upgradeSubscription(data: CreateSubscriptionRequest): Promise<any> {
    try {
      // Check if company is on trial
      const company = await prisma.company.findUnique({
        where: { id: data.companyId },
        select: {
          subscriptionPlan: true,
          subscriptionStatus: true,
          trialEndsAt: true,
          stripeCustomerId: true,
        },
      });

      if (!company) {
        throw new Error("Company not found");
      }

      // Only allow upgrade if company is on trial
      if (company.subscriptionPlan !== "trial") {
        throw new Error("Company can only upgrade from trial plan");
      }

      // Get plan details first
      const plan = await prisma.subscriptionPlan.findFirst({
        where: { id: data.priceId },
        select: { name: true, priceMonthly: true, priceYearly: true },
      });

      if (!plan) {
        throw new Error("Subscription plan not found");
      }

      // For now, we'll simulate a successful upgrade without creating a Stripe subscription
      // In a production system, you would create the actual Stripe subscription here
      const mockSubscription = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        object: "subscription" as const,
        application: null,
        application_fee_percent: null,
        automatic_tax: { enabled: false },
        billing_cycle_anchor: Math.floor(Date.now() / 1000),
        billing_thresholds: null,
        cancel_at: null,
        cancel_at_period_end: false,
        canceled_at: null,
        collection_method: "charge_automatically" as const,
        created: Math.floor(Date.now() / 1000),
        currency: "usd",
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
        current_period_start: Math.floor(Date.now() / 1000),
        customer: `cus_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        default_payment_method: data.paymentMethodId || null,
        default_source: null,
        default_tax_rates: [],
        description: null,
        discount: null,
        ended_at: null,
        items: {
          object: "list" as const,
          data: [
            {
              id: `si_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              object: "subscription_item" as const,
              billing_thresholds: null,
              created: Math.floor(Date.now() / 1000),
              metadata: {},
              price: {
                id: data.priceId,
                object: "price" as const,
                active: true,
                billing_scheme: "per_unit" as const,
                created: Math.floor(Date.now() / 1000),
                currency: "usd",
                custom_unit_amount: null,
                livemode: false,
                lookup_key: null,
                metadata: {},
                nickname: null,
                product: `prod_${Date.now()}_${Math.random()
                  .toString(36)
                  .substr(2, 9)}`,
                recurring: {
                  aggregate_usage: null,
                  interval: "month" as const,
                  interval_count: 1,
                  trial_period_days: null,
                  usage_type: "licensed" as const,
                },
                tax_behavior: "unspecified" as const,
                tiers_mode: null,
                transform_quantity: null,
                type: "recurring" as const,
                unit_amount: Math.round(Number(plan.priceMonthly) * 100), // Convert to cents
                unit_amount_decimal: Math.round(
                  Number(plan.priceMonthly) * 100
                ).toString(),
              },
              quantity: 1,
              subscription: `sub_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              tax_rates: [],
            },
          ],
          has_more: false,
          total_count: 1,
          url: "",
        },
        latest_invoice: null,
        livemode: false,
        metadata: { companyId: data.companyId },
        next_pending_invoice_item_invoice: null,
        on_behalf_of: null,
        pause_collection: null,
        payment_settings: {
          payment_method_options: null,
          payment_method_types: null,
          save_default_payment_method: "on_subscription" as const,
        },
        pending_invoice_item_interval: null,
        pending_setup_intent: null,
        pending_update: null,
        schedule: null,
        start_date: Math.floor(Date.now() / 1000),
        status: "active" as const,
        test_clock: null,
        transfer_data: null,
        trial_end: null,
        trial_start: null,
      };

      // Update company subscription plan
      await prisma.company.update({
        where: { id: data.companyId },
        data: {
          subscriptionPlan: plan.name,
          subscriptionStatus: "ACTIVE",
        },
      });

      // Send upgrade confirmation email
      try {
        await this.paymentEmailService.sendPlanUpgradeConfirmationWithData(
          data.companyId,
          plan.name,
          Number(plan.priceMonthly) || 0,
          "USD"
        );
      } catch (emailError) {
        logger.error("Failed to send upgrade confirmation email:", emailError);
        // Don't throw error, just log it
      }

      logger.info(
        `Upgraded subscription for company ${data.companyId}: ${mockSubscription.id}`
      );
      return mockSubscription;
    } catch (error) {
      logger.error("Error upgrading subscription:", error);
      throw error;
    }
  }

  /**
   * Update an existing subscription
   */
  async updateSubscription(data: UpdateSubscriptionRequest): Promise<any> {
    try {
      // For now, we'll simulate subscription updates without calling Stripe
      // In a production system, you would call Stripe API here

      // For now, we'll find the company by looking for a subscription ID pattern
      // In a production system, you would store the subscription ID properly
      const company = await prisma.company.findFirst({
        where: {
          subscriptionStatus: "ACTIVE",
          subscriptionPlan: { not: "trial" },
        },
        select: { id: true, subscriptionPlan: true },
      });

      if (!company) {
        throw new Error("Subscription not found");
      }

      // Get the new plan details if priceId is provided
      let newPlan = null;
      if (data.priceId) {
        newPlan = await prisma.subscriptionPlan.findFirst({
          where: { id: data.priceId },
          select: { name: true, priceMonthly: true, priceYearly: true },
        });
      }

      // Update company subscription plan if new plan is provided
      if (newPlan) {
        await prisma.company.update({
          where: { id: company.id },
          data: {
            subscriptionPlan: newPlan.name,
          },
        });
      }

      // Return a mock updated subscription
      const mockUpdatedSubscription = {
        id: data.subscriptionId,
        object: "subscription" as const,
        status: "active" as const,
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        trial_end: null,
        cancel_at_period_end: false,
        canceled_at: null,
        items: {
          object: "list" as const,
          data: [
            {
              id: `si_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              object: "subscription_item" as const,
              price: {
                id: data.priceId || "current_price",
                object: "price" as const,
                unit_amount: newPlan
                  ? Math.round(Number(newPlan.priceMonthly) * 100)
                  : 0,
                currency: "usd",
              },
              quantity: data.quantity || 1,
            },
          ],
          has_more: false,
          total_count: 1,
          url: "",
        },
      };

      logger.info(
        `Updated subscription ${data.subscriptionId} for company ${company.id}`
      );
      return mockUpdatedSubscription;
    } catch (error) {
      logger.error("Error updating subscription:", error);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    immediately: boolean = false
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.getStripe().subscriptions.update(
        subscriptionId,
        {
          cancel_at_period_end: !immediately,
          ...(immediately && { cancel_at: Math.floor(Date.now() / 1000) }),
        }
      );

      logger.info(`Cancelled subscription ${subscriptionId}`);
      return subscription;
    } catch (error) {
      logger.error("Error cancelling subscription:", error);
      throw error;
    }
  }

  /**
   * Get payment methods for a company
   */
  async getPaymentMethods(companyId: string): Promise<PaymentMethodData[]> {
    try {
      const customer = await this.getOrCreateCustomer(companyId);

      const paymentMethods = await this.getStripe().paymentMethods.list({
        customer: customer.id,
        type: "card",
      });

      return paymentMethods.data.map((pm) => ({
        id: pm.id,
        type: pm.type,
        card: pm.card
          ? {
            brand: pm.card.brand,
            last4: pm.card.last4,
            expMonth: pm.card.exp_month,
            expYear: pm.card.exp_year,
          }
          : undefined,
        billing_details: {
          email: pm.billing_details.email || undefined,
          name: pm.billing_details.name || undefined,
          address: pm.billing_details.address || undefined,
        },
      }));
    } catch (error) {
      logger.error("Error retrieving payment methods:", error);
      throw error;
    }
  }

  /**
   * Create a setup intent for saving payment methods
   */
  async createSetupIntent(companyId: string): Promise<Stripe.SetupIntent> {
    try {
      const customer = await this.getOrCreateCustomer(companyId);

      const setupIntent = await this.getStripe().setupIntents.create({
        customer: customer.id,
        payment_method_types: ["card"],
        usage: "off_session",
      });

      logger.info(
        `Created setup intent for company ${companyId}: ${setupIntent.id}`
      );
      return setupIntent;
    } catch (error) {
      logger.error("Error creating setup intent:", error);
      throw error;
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      return await this.getStripe().subscriptions.retrieve(subscriptionId, {
        expand: ["latest_invoice", "default_payment_method"],
      });
    } catch (error) {
      logger.error("Error retrieving subscription:", error);
      throw error;
    }
  }

  /**
   * Get company's subscriptions
   */
  async getCompanySubscriptions(companyId: string) {
    try {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: {
          id: true,
          name: true,
          subscriptionPlan: true,
          subscriptionStatus: true,
          trialEndsAt: true,
          stripeSubscriptionId: true,
          stripeCustomerId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!company) {
        throw new Error("Company not found");
      }

      // Return current subscription details
      return [
        {
          id: company.stripeSubscriptionId || company.id,
          plan: company.subscriptionPlan,
          status: company.subscriptionStatus,
          trialEndsAt: company.trialEndsAt,
          createdAt: company.createdAt,
          updatedAt: company.updatedAt,
        },
      ];
    } catch (error) {
      logger.error("Error retrieving company subscriptions:", error);
      throw error;
    }
  }

  /**
   * Process refund
   */
  async processRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ): Promise<Stripe.Refund> {
    try {
      const refundData: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to cents
      }

      if (reason) {
        refundData.reason = reason as Stripe.RefundCreateParams.Reason;
      }

      const refund = await this.getStripe().refunds.create(refundData);

      logger.info(
        `Processed refund for payment intent ${paymentIntentId}: ${refund.id}`
      );
      return refund;
    } catch (error) {
      logger.error("Error processing refund:", error);
      throw error;
    }
  }

  /**
   * Handle Stripe webhooks
   */
  async handleWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case "payment_intent.succeeded":
          await this.handlePaymentIntentSucceeded(
            event.data.object as Stripe.PaymentIntent
          );
          break;
        case "payment_intent.payment_failed":
          logger.info(`Payment failed: ${event.data.object.id}`);
          break;
        case "invoice.payment_succeeded":
          await this.handleInvoicePaymentSucceeded(
            event.data.object as Stripe.Invoice
          );
          break;
        case "invoice.payment_failed":
          logger.info(`Invoice payment failed: ${event.data.object.id}`);
          break;
        case "customer.subscription.updated":
          logger.info(`Subscription updated: ${event.data.object.id}`);
          break;
        case "customer.subscription.deleted":
          logger.info(`Subscription deleted: ${event.data.object.id}`);
          break;
        default:
          logger.info(`Unhandled webhook event type: ${event.type}`);
      }
    } catch (error) {
      logger.error("Error handling webhook:", error);
      throw error;
    }
  }

  /**
   * Handle successful payment intent
   */
  private async handlePaymentIntentSucceeded(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    try {
      logger.info(`Payment succeeded: ${paymentIntent.id}`);

      // Get company ID from metadata
      const companyId = paymentIntent.metadata.companyId;
      if (!companyId) {
        logger.warn(
          `No company ID found in payment intent metadata: ${paymentIntent.id}`
        );
        return;
      }

      // Get subscription details if this is a subscription payment
      let planName: string | undefined;
      if (paymentIntent.metadata.subscriptionId) {
        const subscription = await this.getStripe().subscriptions.retrieve(
          paymentIntent.metadata.subscriptionId
        );
        // You might want to get plan name from subscription items
        planName = "Subscription Plan";
      }

      // Send payment receipt email
      try {
        await this.paymentEmailService.sendPaymentReceiptWithData(
          companyId,
          paymentIntent,
          planName
        );
      } catch (emailError) {
        logger.error("Failed to send payment receipt email:", emailError);
      }
    } catch (error) {
      logger.error("Error handling payment intent succeeded:", error);
    }
  }

  /**
   * Handle successful invoice payment
   */
  private async handleInvoicePaymentSucceeded(
    invoice: Stripe.Invoice
  ): Promise<void> {
    try {
      logger.info(`Invoice payment succeeded: ${invoice.id}`);

      // Get company ID from customer
      if (invoice.customer) {
        const customer = await this.getStripe().customers.retrieve(
          invoice.customer as string
        );
        const companyId = (customer as any).metadata?.companyId;

        if (companyId) {
          // Create a payment intent object for the email
          const paymentIntent = {
            id: (invoice as any).payment_intent as string,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: "succeeded",
            created: Math.floor(Date.now() / 1000),
            client_secret: "",
            metadata: { companyId },
          } as any;

          // Send payment receipt email
          try {
            await this.paymentEmailService.sendPaymentReceiptWithData(
              companyId,
              paymentIntent,
              "Subscription Payment"
            );
          } catch (emailError) {
            logger.error("Failed to send payment receipt email:", emailError);
          }
        }
      }
    } catch (error) {
      logger.error("Error handling invoice payment succeeded:", error);
    }
  }

  /**
   * Get available subscription plans for companies to upgrade to
   */
  async getAvailableSubscriptionPlans() {
    try {
      const plans = await prisma.subscriptionPlan.findMany({
        where: {
          isActive: true,
          name: { not: "trial" }, // Exclude trial plan
        },
        orderBy: { priceMonthly: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          priceMonthly: true,
          priceYearly: true,
          maxUsers: true,
          maxRFQsPerMonth: true,
          maxContacts: true,
          maxEmailSendsPerMonth: true,
          features: true,
        },
      });

      // For now, we'll use the database ID as the price ID
      // In a production system, you would create Stripe products and prices
      // and store the Stripe price IDs in the database
      return plans.map((plan) => ({
        ...plan,
        priceId: plan.id, // Use database ID as price ID for now
      }));
    } catch (error) {
      logger.error("Error retrieving subscription plans:", error);
      throw error;
    }
  }

  /**
   * Get company's current subscription status
   */
  async getCompanySubscriptionStatus(companyId: string) {
    try {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: {
          subscriptionPlan: true,
          subscriptionStatus: true,
          trialEndsAt: true,
          stripeCustomerId: true,
          pendingPlanId: true,
          paymentDeadline: true,
        },
      });

      if (!company) {
        throw new Error("Company not found");
      }

      const isTrialExpired =
        company.trialEndsAt && new Date() > company.trialEndsAt;
      const daysLeftInTrial = company.trialEndsAt
        ? Math.ceil(
          (company.trialEndsAt.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
        )
        : 0;

      // Check if payment deadline has passed
      const hasPaymentDeadlinePassed =
        company.paymentDeadline && new Date() > company.paymentDeadline;

      return {
        currentPlan: company.subscriptionPlan,
        status: company.subscriptionStatus,
        trialEndsAt: company.trialEndsAt,
        isTrialExpired,
        daysLeftInTrial: Math.max(0, daysLeftInTrial),
        canUpgrade: company.subscriptionPlan === "trial",
        hasStripeCustomer: !!company.stripeCustomerId,
        pendingPlanId: company.pendingPlanId,
        paymentDeadline: company.paymentDeadline,
        hasPaymentDeadlinePassed,
      };
    } catch (error) {
      logger.error("Error getting company subscription status:", error);
      throw error;
    }
  }

  /**
   * Request plan change with 6-hour payment window
   */
  async requestPlanChange(companyId: string, planId: string) {
    try {
      // Validate plan exists
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId },
        select: {
          id: true,
          name: true,
          priceMonthly: true,
          isActive: true,
        },
      });

      if (!plan || !plan.isActive) {
        throw new Error("Invalid or inactive plan");
      }

      // Set payment deadline to 6 hours from now
      const paymentDeadline = new Date();
      paymentDeadline.setHours(paymentDeadline.getHours() + 6);

      // Update company with pending plan
      await prisma.company.update({
        where: { id: companyId },
        data: {
          pendingPlanId: planId,
          paymentDeadline: paymentDeadline,
        },
      });

      logger.info(
        `Plan change requested for company ${companyId} to plan ${planId}. Payment deadline: ${paymentDeadline}`
      );

      return {
        planId: plan.id,
        planName: plan.name,
        priceMonthly: plan.priceMonthly,
        paymentDeadline: paymentDeadline,
        hoursRemaining: 6,
      };
    } catch (error) {
      logger.error("Error requesting plan change:", error);
      throw error;
    }
  }

  /**
   * Complete plan upgrade after successful payment
   */
  async completePlanUpgrade(companyId: string) {
    try {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: {
          pendingPlanId: true,
          paymentDeadline: true,
        },
      });

      if (!company || !company.pendingPlanId) {
        throw new Error("No pending plan upgrade found");
      }

      // Check if payment deadline has passed
      if (company.paymentDeadline && new Date() > company.paymentDeadline) {
        // Cancel the pending upgrade
        await this.cancelPendingPlanUpgrade(companyId);
        throw new Error("Payment deadline has passed. Plan upgrade cancelled.");
      }

      // Get plan details
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: company.pendingPlanId },
        select: { name: true, priceMonthly: true },
      });

      if (!plan) {
        throw new Error("Plan not found");
      }

      // Update company to the new plan
      await prisma.company.update({
        where: { id: companyId },
        data: {
          subscriptionPlan: plan.name,
          subscriptionStatus: "ACTIVE",
          pendingPlanId: null,
          paymentDeadline: null,
        },
      });

      logger.info(
        `Completed plan upgrade for company ${companyId} to ${plan.name}`
      );

      return {
        planName: plan.name,
        priceMonthly: plan.priceMonthly,
        status: "ACTIVE",
      };
    } catch (error) {
      logger.error("Error completing plan upgrade:", error);
      throw error;
    }
  }

  /**
   * Cancel pending plan upgrade
   */
  async cancelPendingPlanUpgrade(companyId: string) {
    try {
      await prisma.company.update({
        where: { id: companyId },
        data: {
          pendingPlanId: null,
          paymentDeadline: null,
        },
      });

      logger.info(`Cancelled pending plan upgrade for company ${companyId}`);
      return { success: true };
    } catch (error) {
      logger.error("Error cancelling pending plan upgrade:", error);
      throw error;
    }
  }

  /**
   * Check and cancel expired pending upgrades (run periodically)
   */
  async cancelExpiredPendingUpgrades() {
    try {
      const now = new Date();

      const expiredCompanies = await prisma.company.findMany({
        where: {
          pendingPlanId: { not: null },
          paymentDeadline: { lt: now },
        },
        select: { id: true, name: true },
      });

      for (const company of expiredCompanies) {
        await this.cancelPendingPlanUpgrade(company.id);
        logger.info(
          `Auto-cancelled expired plan upgrade for company ${company.name}`
        );
      }

      return {
        cancelledCount: expiredCompanies.length,
        companies: expiredCompanies,
      };
    } catch (error) {
      logger.error("Error cancelling expired pending upgrades:", error);
      throw error;
    }
  }

  /**
   * Get pending payment invoice details
   */
  async getPendingPaymentInvoice(companyId: string) {
    try {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: {
          id: true,
          name: true,
          email: true,
          subscriptionPlan: true,
          pendingPlanId: true,
          paymentDeadline: true,
        },
      });

      if (!company) {
        throw new Error("Company not found");
      }

      if (!company.pendingPlanId || !company.paymentDeadline) {
        throw new Error("No pending payment found");
      }

      // Check if payment deadline has passed
      if (new Date() > company.paymentDeadline) {
        await this.cancelPendingPlanUpgrade(companyId);
        throw new Error("Payment deadline has expired");
      }

      // Get pending plan details
      const pendingPlan = await prisma.subscriptionPlan.findUnique({
        where: { id: company.pendingPlanId },
        select: {
          id: true,
          name: true,
          description: true,
          priceMonthly: true,
          priceYearly: true,
          maxUsers: true,
          maxRFQsPerMonth: true,
          maxContacts: true,
          maxEmailSendsPerMonth: true,
          features: true,
        },
      });

      if (!pendingPlan) {
        throw new Error("Pending plan not found");
      }

      // Calculate time remaining
      const now = new Date();
      const timeRemaining = company.paymentDeadline.getTime() - now.getTime();
      const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutesRemaining = Math.floor(
        (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
      );

      // Calculate amounts (using monthly price by default)
      const subtotal = Number(pendingPlan.priceMonthly);
      const tax = subtotal * 0.1; // 10% tax (adjust as needed)
      const total = subtotal + tax;

      return {
        invoiceId: `INV-${company.id.substring(0, 8)}-${Date.now()}`,
        company: {
          id: company.id,
          name: company.name,
          email: company.email,
        },
        currentPlan: company.subscriptionPlan,
        pendingPlan: {
          id: pendingPlan.id,
          name: pendingPlan.name,
          description: pendingPlan.description,
          features: pendingPlan.features,
          maxUsers: pendingPlan.maxUsers,
          maxRFQsPerMonth: pendingPlan.maxRFQsPerMonth,
          maxContacts: pendingPlan.maxContacts,
          maxEmailSendsPerMonth: pendingPlan.maxEmailSendsPerMonth,
        },
        billing: {
          subtotal: subtotal,
          tax: tax,
          total: total,
          currency: "USD",
          billingCycle: "monthly",
        },
        paymentDeadline: company.paymentDeadline,
        timeRemaining: {
          hours: hoursRemaining,
          minutes: minutesRemaining,
          totalMinutes: Math.floor(timeRemaining / (1000 * 60)),
        },
        createdAt: new Date(),
      };
    } catch (error) {
      logger.error("Error getting pending payment invoice:", error);
      throw error;
    }
  }

  /**
   * Process payment for pending plan upgrade
   */
  async processPendingPlanPayment(
    companyId: string,
    paymentData: {
      cardNumber?: string;
      expMonth?: string;
      expYear?: string;
      cvc?: string;
      paymentMethodId?: string;
    }
  ) {
    try {
      // Get invoice details first
      const invoice = await this.getPendingPaymentInvoice(companyId);

      // Get or create Stripe customer
      const customer = await this.getOrCreateCustomer(companyId);

      const paymentMethodId = paymentData.paymentMethodId;

      if (!paymentMethodId) {
        throw new Error(
          "PaymentMethod ID is required. For testing, use Stripe test payment methods like 'pm_card_visa'."
        );
      }

      // Create payment intent
      // Note: PaymentMethod will be automatically attached to customer when confirmed
      let paymentIntent;

      if (this.isMockMode()) {
        logger.info(`Processing MOCK payment for company ${companyId}`);
        paymentIntent = {
          id: `pi_mock_${Date.now()}`,
          status: "succeeded",
          amount: Math.round(invoice.billing.total * 100),
          currency: invoice.billing.currency.toLowerCase(),
          customer: customer.id,
          metadata: {
            companyId: companyId,
            planId: invoice.pendingPlan.id,
          },
        } as any;
      } else {
        paymentIntent = await this.getStripe().paymentIntents.create({
          amount: Math.round(invoice.billing.total * 100), // Convert to cents
          currency: invoice.billing.currency.toLowerCase(),
          customer: customer.id,
          payment_method: paymentMethodId,
          confirm: true,
          description: `Subscription upgrade to ${invoice.pendingPlan.name}`,
          metadata: {
            companyId: companyId,
            planId: invoice.pendingPlan.id,
            planName: invoice.pendingPlan.name,
            invoiceId: invoice.invoiceId,
          },
          automatic_payment_methods: {
            enabled: true,
            allow_redirects: "never",
          },
          setup_future_usage: "off_session",
        });
      }

      // If payment succeeded, complete the upgrade
      if (paymentIntent.status === "succeeded") {
        await this.completePlanUpgrade(companyId);

        // Send confirmation email
        try {
          await this.paymentEmailService.sendPlanUpgradeConfirmationWithData(
            companyId,
            invoice.pendingPlan.name,
            invoice.billing.total,
            invoice.billing.currency
          );
        } catch (emailError) {
          logger.error(
            "Failed to send upgrade confirmation email:",
            emailError
          );
        }

        logger.info(
          `Payment processed successfully for company ${companyId}: ${paymentIntent.id}`
        );
      }

      return {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      logger.error("Error processing pending plan payment:", error);
      throw error;
    }
  }

  /**
   * Get company's transaction history (simplified)
   */
  async getCompanyTransactions(
    companyId: string,
    limit: number = 50,
    offset: number = 0
  ) {
    try {
      const customer = await this.getOrCreateCustomer(companyId);

      // Get payment intents for this customer
      const paymentIntents = await this.getStripe().paymentIntents.list({
        customer: customer.id,
        limit: limit,
      });

      // Map to transaction format
      const transactions = paymentIntents.data.map((pi) => ({
        id: pi.id,
        amount: pi.amount / 100, // Convert from cents
        currency: pi.currency.toUpperCase(),
        status: pi.status,
        description: pi.description || "Payment",
        createdAt: new Date(pi.created * 1000),
        paymentMethod: pi.payment_method,
        metadata: pi.metadata,
      }));

      logger.info(
        `Retrieved ${transactions.length} transactions for company ${companyId}`
      );
      return transactions;
    } catch (error) {
      logger.error("Error getting company transactions:", error);
      return [];
    }
  }

  /**
   * Get company's financial summary
   */
  async getCompanyFinancialSummary(companyId: string) {
    try {
      const customer = await this.getOrCreateCustomer(companyId);

      // Get all payment intents
      const paymentIntents = await this.getStripe().paymentIntents.list({
        customer: customer.id,
        limit: 100,
      });

      // Calculate metrics
      const successfulPayments = paymentIntents.data.filter(
        (pi) => pi.status === "succeeded"
      );
      const failedPayments = paymentIntents.data.filter(
        (pi) =>
          pi.status === "canceled" || (pi as any).status === "payment_failed"
      );

      const totalRevenue = successfulPayments.reduce(
        (sum, pi) => sum + pi.amount / 100,
        0
      );

      // Get refunds
      const refunds = await this.getStripe().refunds.list({
        limit: 100,
      });
      const companyRefunds = refunds.data.filter((refund) =>
        successfulPayments.some((pi) => pi.id === refund.payment_intent)
      );

      const totalRefunded = companyRefunds.reduce(
        (sum, refund) => sum + refund.amount / 100,
        0
      );

      // Get company subscription for MRR/ARR
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: {
          subscriptionPlan: true,
        },
      });

      // Get plan details for MRR/ARR calculation
      let monthlyRecurringRevenue = 0;
      let annualRecurringRevenue = 0;

      if (company && company.subscriptionPlan !== "trial") {
        const plan = await prisma.subscriptionPlan.findFirst({
          where: { name: company.subscriptionPlan },
          select: {
            priceMonthly: true,
            priceYearly: true,
          },
        });

        if (plan) {
          monthlyRecurringRevenue = Number(plan.priceMonthly);
          annualRecurringRevenue = Number(plan.priceYearly);
        }
      }

      const averageTransactionValue =
        successfulPayments.length > 0
          ? totalRevenue / successfulPayments.length
          : 0;

      logger.info(`Financial summary calculated for company ${companyId}`);

      return {
        totalRevenue: totalRevenue - totalRefunded,
        totalTransactions: paymentIntents.data.length,
        successfulTransactions: successfulPayments.length,
        failedTransactions: failedPayments.length,
        refundedTransactions: companyRefunds.length,
        totalRefunded: totalRefunded,
        averageTransactionValue: averageTransactionValue,
        monthlyRecurringRevenue: monthlyRecurringRevenue,
        annualRecurringRevenue: annualRecurringRevenue,
        lastUpdatedAt: new Date(),
      };
    } catch (error) {
      logger.error("Error getting financial summary:", error);
      return {
        totalRevenue: 0,
        totalTransactions: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        refundedTransactions: 0,
        totalRefunded: 0,
        averageTransactionValue: 0,
        monthlyRecurringRevenue: 0,
        annualRecurringRevenue: 0,
        lastUpdatedAt: new Date(),
      };
    }
  }
}

export default PaymentService;
