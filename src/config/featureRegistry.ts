/**
 * ──────────────────────────────────────────────────────────────
 *  FEATURE REGISTRY
 * ──────────────────────────────────────────────────────────────
 *
 *  Single source of truth for every feature flag a SubscriptionPlan
 *  can contain.  The admin passes feature keys as a JSON object when
 *  creating / updating a plan:
 *
 *    { "basicRFQ": true, "advancedAnalytics": false, ... }
 *
 *  - The middleware `enforceFeature("advancedAnalytics")` reads the
 *    plan's features JSON and blocks the request when the value is
 *    explicitly `false`.
 *  - If a key is missing from the JSON it defaults to the
 *    `defaultValue` defined here (opt-out model = allowed unless
 *    explicitly disabled).
 *
 *  HOW THE PIECES CONNECT
 *  ──────────────────────
 *  1. Admin creates/updates a SubscriptionPlan via
 *     POST / PUT  /api/v1/admin/subscription-plans
 *     → the `features` JSON is validated against FEATURE_REGISTRY
 *       (unknown keys are rejected).
 *
 *  2. Admin assigns a plan to a company via
 *     PUT  /api/v1/admin/subscriptions/:companyId
 *     → company.subscriptionPlan is set to plan.name
 *
 *  3. Company makes a request (e.g. POST /api/v1/rfqs)
 *     → middleware reads company.subscriptionPlan name
 *     → looks up SubscriptionPlan by that name
 *     → checks numeric limits  (maxRFQsPerMonth, maxContacts …)
 *     → checks feature flags   (enforceFeature("basicRFQ"))
 *     → blocks or allows the request
 * ──────────────────────────────────────────────────────────────
 */

export interface FeatureDefinition {
  /** Machine-readable key stored in features JSON (e.g. "advancedAnalytics") */
  key: string;
  /** Human-readable label shown in the admin dashboard */
  label: string;
  /** Short explanation of what this feature gates */
  description: string;
  /** Category for grouping in the UI */
  category: "core" | "email" | "analytics" | "automation" | "ai" | "advanced";
  /** Default value when the key is absent from a plan's features JSON */
  defaultValue: boolean;
}

/**
 * Canonical list of every feature the system understands.
 * Add new features here — they will automatically:
 *   • appear in the GET /feature-registry endpoint
 *   • be accepted during plan creation / update validation
 *   • be enforceable via the `enforceFeature()` middleware
 */
export const FEATURE_REGISTRY: FeatureDefinition[] = [
  // ── Core ───────────────────────────────────────────────
  {
    key: "basicRFQ",
    label: "Basic RFQ",
    description: "Create and manage RFQs",
    category: "core",
    defaultValue: true,
  },
  {
    key: "basicQuotes",
    label: "Basic Quotes",
    description: "Create and manage quotes for RFQs",
    category: "core",
    defaultValue: true,
  },
  {
    key: "contactManagement",
    label: "Contact Management",
    description: "Manage shipping-line contacts",
    category: "core",
    defaultValue: true,
  },
  {
    key: "templateManagement",
    label: "Template Management",
    description: "Create and manage email / RFQ templates",
    category: "core",
    defaultValue: true,
  },

  // ── Email ──────────────────────────────────────────────
  {
    key: "emailSupport",
    label: "Email Sending",
    description: "Send individual emails to contacts",
    category: "email",
    defaultValue: true,
  },
  {
    key: "bulkEmail",
    label: "Bulk Email",
    description: "Send bulk emails to multiple contacts at once",
    category: "email",
    defaultValue: false,
  },
  {
    key: "emailTracking",
    label: "Email Tracking",
    description: "Track email opens, clicks, and replies",
    category: "email",
    defaultValue: false,
  },

  // ── Analytics ──────────────────────────────────────────
  {
    key: "basicAnalytics",
    label: "Basic Analytics",
    description: "View performance metrics and basic charts",
    category: "analytics",
    defaultValue: true,
  },
  {
    key: "advancedAnalytics",
    label: "Advanced Analytics",
    description: "Carrier performance, route analysis, cost analysis, market intelligence",
    category: "analytics",
    defaultValue: false,
  },
  {
    key: "exportReports",
    label: "Export Reports",
    description: "Export analytics data as CSV, Excel, or PDF",
    category: "analytics",
    defaultValue: false,
  },

  // ── Automation ─────────────────────────────────────────
  {
    key: "autoFollowUp",
    label: "Auto Follow-Up",
    description: "Automatically send follow-up emails based on rules",
    category: "automation",
    defaultValue: false,
  },
  {
    key: "scheduledReports",
    label: "Scheduled Reports",
    description: "Schedule recurring analytics reports",
    category: "automation",
    defaultValue: false,
  },

  // ── AI ─────────────────────────────────────────────────
  {
    key: "aiParsing",
    label: "AI Reply Parsing",
    description: "Automatically parse email replies and extract quote data using AI",
    category: "ai",
    defaultValue: false,
  },
  {
    key: "aiRateOptimization",
    label: "AI Rate Optimization",
    description: "AI-powered rate optimization suggestions",
    category: "ai",
    defaultValue: false,
  },

  // ── Advanced ───────────────────────────────────────────
  {
    key: "multiUser",
    label: "Multi-User Access",
    description: "Invite multiple users with role-based access",
    category: "advanced",
    defaultValue: false,
  },
  {
    key: "apiAccess",
    label: "API Access",
    description: "Access the RFQ platform via REST API keys",
    category: "advanced",
    defaultValue: false,
  },
  {
    key: "customBranding",
    label: "Custom Branding",
    description: "Custom email footer and branding options",
    category: "advanced",
    defaultValue: false,
  },
];

/** Quick lookup: feature key → definition */
export const FEATURE_MAP = new Map<string, FeatureDefinition>(
  FEATURE_REGISTRY.map((f) => [f.key, f])
);

/** Set of all valid feature keys (for fast validation) */
export const VALID_FEATURE_KEYS = new Set(FEATURE_REGISTRY.map((f) => f.key));

/**
 * Build the default features object for the trial plan.
 * Every key whose defaultValue is `true` is included as `true`,
 * everything else as `false`.
 */
export function getTrialDefaults(): Record<string, boolean> {
  const defaults: Record<string, boolean> = {};
  for (const f of FEATURE_REGISTRY) {
    defaults[f.key] = f.defaultValue;
  }
  return defaults;
}

/**
 * Validate that all keys in a features object are recognized.
 * Returns an array of invalid keys (empty = all good).
 */
export function validateFeatureKeys(features: Record<string, unknown>): string[] {
  return Object.keys(features).filter((k) => !VALID_FEATURE_KEYS.has(k));
}

/**
 * Resolve the effective value of a feature given a plan's features JSON.
 * Falls back to the registry default when the key is absent.
 */
export function isFeatureEnabled(
  planFeatures: Record<string, boolean> | null | undefined,
  featureKey: string
): boolean {
  if (planFeatures && featureKey in planFeatures) {
    return !!planFeatures[featureKey];
  }
  const def = FEATURE_MAP.get(featureKey);
  return def ? def.defaultValue : true; // unknown key → allow (fail-open)
}
