export interface PaymentIntentRequest {
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
}

export interface SubscriptionRequest {
  priceId: string;
  paymentMethodId?: string;
  trialPeriodDays?: number;
}

export interface SubscriptionResponse {
  subscriptionId: string;
  status: string;
  clientSecret?: string;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  trialEnd?: number;
}

export interface UpdateSubscriptionRequest {
  priceId?: string;
  quantity?: number;
  prorationBehavior?: "create_prorations" | "none" | "always_invoice";
}

export interface UpdateSubscriptionResponse {
  subscriptionId: string;
  status: string;
  currentPeriodStart: number;
  currentPeriodEnd: number;
}

export interface CancelSubscriptionRequest {
  immediately?: boolean;
}

export interface CancelSubscriptionResponse {
  subscriptionId: string;
  status: string;
  canceledAt?: number;
  cancelAtPeriodEnd: boolean;
}

export interface PaymentMethod {
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

export interface PaymentMethodsResponse {
  paymentMethods: PaymentMethod[];
  count: number;
}

export interface SetupIntentResponse {
  clientSecret: string;
  setupIntentId: string;
  status: string;
}

export interface SubscriptionDetails {
  subscriptionId: string;
  status: string;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  trialEnd?: number;
  cancelAtPeriodEnd: boolean;
  canceledAt?: number;
  defaultPaymentMethod?: any;
  items: any[];
}

export interface CompanySubscriptionsResponse {
  subscriptions: SubscriptionDetails[];
  count: number;
}

export interface RefundRequest {
  amount?: number;
  reason?: "duplicate" | "fraudulent" | "requested_by_customer";
}

export interface RefundResponse {
  refundId: string;
  amount: number;
  status: string;
  reason?: string;
}

export interface Transaction {
  id: string;
  companyId: string;
  subscriptionPlanId?: string;
  transactionType: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod?: string;
  paymentProvider?: string;
  externalId?: string;
  description?: string;
  metadata?: any;
  processedAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  refundedAt?: Date;
  refundAmount?: number;
  refundReason?: string;
  invoiceNumber?: string;
  invoiceUrl?: string;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    limit: number;
    offset: number;
    count: number;
  };
}

export interface FinancialDetails {
  id: string;
  companyId: string;
  totalRevenue: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  refundedTransactions: number;
  averageTransactionValue: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  churnRate: number;
  customerLifetimeValue: number;
  lastUpdatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialSummaryResponse {
  financialDetails?: FinancialDetails;
  recentTransactions: Transaction[];
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
  livemode: boolean;
  pending_webhooks: number;
  request?: {
    id: string;
    idempotency_key?: string;
  };
}

export interface StripeCustomer {
  id: string;
  object: "customer";
  address?: any;
  balance: number;
  created: number;
  currency?: string;
  default_source?: string;
  delinquent: boolean;
  description?: string;
  discount?: any;
  email?: string;
  invoice_prefix?: string;
  invoice_settings?: any;
  livemode: boolean;
  metadata: Record<string, string>;
  name?: string;
  next_invoice_sequence?: number;
  phone?: string;
  preferred_locales: string[];
  shipping?: any;
  tax_exempt: "none" | "exempt" | "reverse";
  test_clock?: string;
}

export interface StripePaymentIntent {
  id: string;
  object: "payment_intent";
  amount: number;
  amount_capturable: number;
  amount_details?: any;
  amount_received: number;
  application?: string;
  application_fee_amount?: number;
  automatic_payment_methods?: any;
  canceled_at?: number;
  cancellation_reason?: string;
  capture_method: "automatic" | "manual";
  charges?: any;
  client_secret: string;
  confirmation_method: "automatic" | "manual";
  created: number;
  currency: string;
  customer?: string;
  description?: string;
  invoice?: string;
  last_payment_error?: any;
  latest_charge?: any;
  livemode: boolean;
  metadata: Record<string, string>;
  next_action?: any;
  on_behalf_of?: string;
  payment_method?: string;
  payment_method_options?: any;
  payment_method_types: string[];
  processing?: any;
  receipt_email?: string;
  review?: string;
  setup_future_usage?: string;
  shipping?: any;
  source?: string;
  statement_descriptor?: string;
  statement_descriptor_suffix?: string;
  status:
    | "requires_payment_method"
    | "requires_confirmation"
    | "requires_action"
    | "processing"
    | "requires_capture"
    | "canceled"
    | "succeeded";
  transfer_data?: any;
  transfer_group?: string;
}

export interface StripeSubscription {
  id: string;
  object: "subscription";
  application?: string;
  application_fee_percent?: number;
  automatic_tax: {
    enabled: boolean;
  };
  billing_cycle_anchor: number;
  billing_thresholds?: any;
  cancel_at?: number;
  cancel_at_period_end: boolean;
  canceled_at?: number;
  cancellation_details?: any;
  collection_method: "charge_automatically" | "send_invoice";
  created: number;
  currency: string;
  current_period_end: number;
  current_period_start: number;
  customer: string;
  default_payment_method?: any;
  default_source?: any;
  default_tax_rates: any[];
  description?: string;
  discount?: any;
  ended_at?: number;
  items: {
    object: "list";
    data: any[];
    has_more: boolean;
    total_count: number;
    url: string;
  };
  latest_invoice?: any;
  livemode: boolean;
  metadata: Record<string, string>;
  next_pending_invoice_item_invoice?: number;
  on_behalf_of?: string;
  pause_collection?: any;
  payment_settings?: any;
  pending_invoice_item_interval?: any;
  pending_setup_intent?: any;
  pending_update?: any;
  schedule?: any;
  start_date: number;
  status:
    | "incomplete"
    | "incomplete_expired"
    | "trialing"
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid"
    | "paused";
  test_clock?: string;
  transfer_data?: any;
  trial_end?: number;
  trial_settings?: any;
  trial_start?: number;
}

export interface StripeRefund {
  id: string;
  object: "refund";
  amount: number;
  charge?: string;
  created: number;
  currency: string;
  description?: string;
  failure_balance_transaction?: string;
  failure_reason?: string;
  metadata: Record<string, string>;
  next_action?: any;
  payment_intent: string;
  reason?: "duplicate" | "fraudulent" | "requested_by_customer";
  receipt_number?: string;
  status: "pending" | "succeeded" | "canceled" | "failed";
  transfer_reversal?: string;
}

export interface StripeSetupIntent {
  id: string;
  object: "setup_intent";
  application?: string;
  automatic_payment_methods?: any;
  cancellation_reason?: string;
  client_secret: string;
  created: number;
  customer?: string;
  description?: string;
  last_setup_error?: any;
  latest_attempt?: any;
  livemode: boolean;
  mandate?: any;
  metadata: Record<string, string>;
  next_action?: any;
  on_behalf_of?: string;
  payment_method?: any;
  payment_method_options?: any;
  payment_method_types: string[];
  single_use_mandate?: any;
  status:
    | "requires_payment_method"
    | "requires_confirmation"
    | "requires_action"
    | "processing"
    | "succeeded"
    | "canceled";
  usage: "off_session" | "on_session";
}
