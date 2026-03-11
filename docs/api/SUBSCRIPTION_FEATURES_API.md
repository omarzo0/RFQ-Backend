# Subscription Plan Features & Enforcement API

> **Date:** March 2026
> This document covers all new/changed endpoints related to subscription plan features, usage limits, and quote analytics.

---

## Table of Contents

- [1. New Endpoints](#1-new-endpoints)
  - [1.1 Feature Registry (Admin)](#11-feature-registry-admin)
  - [1.2 Plan Feature Analytics (Company)](#12-plan-feature-analytics-company)
- [2. Changed Responses](#2-changed-responses)
  - [2.1 Plan List](#21-plan-list)
  - [2.2 Plan Detail](#22-plan-detail)
  - [2.3 Company Detail](#23-company-detail)
- [3. Plan Create/Update — Features Field](#3-plan-createupdate--features-field)
  - [3.1 Valid Feature Keys](#31-valid-feature-keys)
  - [3.2 Example Payload](#32-example-payload)
  - [3.3 Validation Error](#33-validation-error)
- [4. New 403 Error Responses](#4-new-403-error-responses)
  - [4.1 Plan Limit Reached](#41-plan-limit-reached)
  - [4.2 Feature Not Available](#42-feature-not-available)
  - [4.3 Subscription Inactive](#43-subscription-inactive)
- [5. Feature → Route Mapping](#5-feature--route-mapping)
- [6. Quick Reference Table](#6-quick-reference-table)

---

## 1. New Endpoints

### 1.1 Feature Registry (Admin)

```
GET /api/v1/admin/subscription-plans/feature-registry
```

**Auth:** Admin token required

**Purpose:** Returns all valid feature keys the system supports. Use this to build the plan creation/edit form with toggle switches.

**Response:**

```json
{
  "success": true,
  "data": {
    "features": [
      {
        "key": "basicRFQ",
        "label": "Basic RFQ",
        "description": "Create and manage RFQs",
        "category": "core",
        "defaultValue": true
      },
      {
        "key": "bulkEmail",
        "label": "Bulk Email",
        "description": "Send bulk emails to multiple contacts at once",
        "category": "email",
        "defaultValue": false
      }
    ],
    "grouped": {
      "core": [
        { "key": "basicRFQ", "label": "Basic RFQ", "description": "Create and manage RFQs", "category": "core", "defaultValue": true },
        { "key": "basicQuotes", "label": "Basic Quotes", "description": "Create and manage quotes for RFQs", "category": "core", "defaultValue": true },
        { "key": "contactManagement", "label": "Contact Management", "description": "Manage shipping-line contacts", "category": "core", "defaultValue": true },
        { "key": "templateManagement", "label": "Template Management", "description": "Create and manage email / RFQ templates", "category": "core", "defaultValue": true }
      ],
      "email": [
        { "key": "emailSupport", "label": "Email Sending", "description": "Send individual emails to contacts", "category": "email", "defaultValue": true },
        { "key": "bulkEmail", "label": "Bulk Email", "description": "Send bulk emails to multiple contacts at once", "category": "email", "defaultValue": false },
        { "key": "emailTracking", "label": "Email Tracking", "description": "Track email opens, clicks, and replies", "category": "email", "defaultValue": false }
      ],
      "analytics": [
        { "key": "basicAnalytics", "label": "Basic Analytics", "description": "View performance metrics and basic charts", "category": "analytics", "defaultValue": true },
        { "key": "advancedAnalytics", "label": "Advanced Analytics", "description": "Carrier performance, route analysis, cost analysis, market intelligence", "category": "analytics", "defaultValue": false },
        { "key": "exportReports", "label": "Export Reports", "description": "Export analytics data as CSV, Excel, or PDF", "category": "analytics", "defaultValue": false }
      ],
      "automation": [
        { "key": "autoFollowUp", "label": "Auto Follow-Up", "description": "Automatically send follow-up emails based on rules", "category": "automation", "defaultValue": false },
        { "key": "scheduledReports", "label": "Scheduled Reports", "description": "Schedule recurring analytics reports", "category": "automation", "defaultValue": false }
      ],
      "ai": [
        { "key": "aiParsing", "label": "AI Reply Parsing", "description": "Automatically parse email replies and extract quote data using AI", "category": "ai", "defaultValue": false },
        { "key": "aiRateOptimization", "label": "AI Rate Optimization", "description": "AI-powered rate optimization suggestions", "category": "ai", "defaultValue": false }
      ],
      "advanced": [
        { "key": "multiUser", "label": "Multi-User Access", "description": "Invite multiple users with role-based access", "category": "advanced", "defaultValue": false },
        { "key": "apiAccess", "label": "API Access", "description": "Access the RFQ platform via REST API keys", "category": "advanced", "defaultValue": false },
        { "key": "customBranding", "label": "Custom Branding", "description": "Custom email footer and branding options", "category": "advanced", "defaultValue": false }
      ]
    },
    "totalFeatures": 18
  },
  "message": "Feature registry retrieved successfully"
}
```

---

### 1.2 Plan Feature Analytics (Company)

```
GET /api/v1/analytics/plan-features
```

**Auth:** Company user token required

**Purpose:** Returns the company's current plan usage vs limits and quote statistics. Use this for the company dashboard to show usage bars and upgrade prompts.

**Response:**

```json
{
  "success": true,
  "data": {
    "plan": {
      "name": "trial",
      "description": "Free 30-day trial with limited features",
      "features": {
        "basicRFQ": true,
        "basicQuotes": true,
        "emailSupport": true,
        "bulkEmail": false
      },
      "isActive": true
    },
    "subscription": {
      "status": "ACTIVE",
      "trialEndsAt": "2026-04-12T00:00:00.000Z"
    },
    "usage": {
      "users": { "current": 2, "limit": 3, "percentage": 67 },
      "contacts": { "current": 45, "limit": 100, "percentage": 45 },
      "rfqsThisMonth": { "current": 12, "limit": 50, "percentage": 24 },
      "emailsThisMonth": { "current": 80, "limit": 200, "percentage": 40 }
    },
    "quoteStats": {
      "totalQuotes": 25,
      "activeQuotes": 10,
      "awardedQuotes": 5,
      "expiredQuotes": 3,
      "awardRate": 20.0,
      "averageQuoteAmount": 1500,
      "bySource": [
        { "source": "EMAIL", "count": 15 },
        { "source": "MANUAL", "count": 8 },
        { "source": "PHONE", "count": 2 }
      ],
      "byStatus": [
        { "status": "ACTIVE", "count": 10 },
        { "status": "AWARDED", "count": 5 },
        { "status": "EXPIRED", "count": 3 },
        { "status": "WITHDRAWN", "count": 7 }
      ]
    }
  },
  "message": "Plan feature analytics retrieved successfully"
}
```

**Notes:**
- `percentage` is `null` when `limit` is `null` (unlimited).
- `limit` is `null` for plans with no cap on that resource.

---

## 2. Changed Responses

### 2.1 Plan List

```
GET /api/v1/admin/subscription-plans
```

Each plan object now includes a **`featureSummary`** field:

```json
{
  "id": "uuid",
  "name": "trial",
  "features": { "basicRFQ": true, "bulkEmail": false },
  "featureSummary": {
    "enabledCount": 7,
    "totalCount": 18
  },
  "isDefault": true,
  "usageStats": { ... }
}
```

---

### 2.2 Plan Detail

```
GET /api/v1/admin/subscription-plans/:id
```

Now includes a **`resolvedFeatures`** array — the raw `features` JSON resolved against the registry with labels, descriptions, and effective enabled state:

```json
{
  "id": "uuid",
  "name": "professional",
  "features": { "basicRFQ": true, "advancedAnalytics": true },
  "resolvedFeatures": [
    {
      "key": "basicRFQ",
      "label": "Basic RFQ",
      "description": "Create and manage RFQs",
      "category": "core",
      "enabled": true,
      "explicitlySet": true
    },
    {
      "key": "bulkEmail",
      "label": "Bulk Email",
      "description": "Send bulk emails to multiple contacts at once",
      "category": "email",
      "enabled": false,
      "explicitlySet": false
    }
  ],
  "isDefault": false,
  "usageStats": { ... }
}
```

**Field meanings:**
- `enabled` — the effective value (from plan JSON, or falls back to registry default)
- `explicitlySet` — whether this key exists in the plan's `features` JSON (`true`) or is using the registry default (`false`)

---

### 2.3 Company Detail

```
GET /api/v1/admin/companies/:id
```

Now includes **`quoteStats`** and **`planDetails`**:

```json
{
  "id": "uuid",
  "name": "Acme Shipping",
  "subscriptionPlan": "trial",
  "quoteStats": {
    "totalQuotes": 25,
    "awardedQuotes": 5,
    "activeQuotes": 10
  },
  "planDetails": {
    "name": "trial",
    "maxUsers": 3,
    "maxRFQsPerMonth": 50,
    "maxContacts": 100,
    "maxEmailSendsPerMonth": 200,
    "features": {
      "basicRFQ": true,
      "basicQuotes": true,
      "emailSupport": true,
      "bulkEmail": false
    }
  }
}
```

**Note:** `planDetails` is `null` if the company's plan name doesn't match any `SubscriptionPlan` record.

---

## 3. Plan Create/Update — Features Field

### 3.1 Valid Feature Keys

When sending `features` in `POST /api/v1/admin/subscription-plans` or `PUT /api/v1/admin/subscription-plans/:id`, only these keys are accepted:

| Key | Label | Category | Default |
|-----|-------|----------|---------|
| `basicRFQ` | Basic RFQ | core | `true` |
| `basicQuotes` | Basic Quotes | core | `true` |
| `contactManagement` | Contact Management | core | `true` |
| `templateManagement` | Template Management | core | `true` |
| `emailSupport` | Email Sending | email | `true` |
| `bulkEmail` | Bulk Email | email | `false` |
| `emailTracking` | Email Tracking | email | `false` |
| `basicAnalytics` | Basic Analytics | analytics | `true` |
| `advancedAnalytics` | Advanced Analytics | analytics | `false` |
| `exportReports` | Export Reports | analytics | `false` |
| `autoFollowUp` | Auto Follow-Up | automation | `false` |
| `scheduledReports` | Scheduled Reports | automation | `false` |
| `aiParsing` | AI Reply Parsing | ai | `false` |
| `aiRateOptimization` | AI Rate Optimization | ai | `false` |
| `multiUser` | Multi-User Access | advanced | `false` |
| `apiAccess` | API Access | advanced | `false` |
| `customBranding` | Custom Branding | advanced | `false` |

### 3.2 Example Payload

```json
{
  "name": "professional",
  "description": "For growing freight forwarders",
  "priceMonthly": 49.99,
  "priceYearly": 499.99,
  "maxUsers": 10,
  "maxRFQsPerMonth": 500,
  "maxContacts": 1000,
  "maxEmailSendsPerMonth": 5000,
  "features": {
    "basicRFQ": true,
    "basicQuotes": true,
    "contactManagement": true,
    "templateManagement": true,
    "emailSupport": true,
    "bulkEmail": true,
    "emailTracking": true,
    "basicAnalytics": true,
    "advancedAnalytics": true,
    "exportReports": false,
    "autoFollowUp": false,
    "scheduledReports": false,
    "aiParsing": false,
    "aiRateOptimization": false,
    "multiUser": true,
    "apiAccess": false,
    "customBranding": false
  }
}
```

### 3.3 Validation Error

Sending an unknown feature key returns **400**:

```json
{
  "success": false,
  "error": "Unknown feature keys: fakeFeature, anotherBad. Valid keys are: basicRFQ, basicQuotes, contactManagement, templateManagement, emailSupport, bulkEmail, emailTracking, basicAnalytics, advancedAnalytics, exportReports, autoFollowUp, scheduledReports, aiParsing, aiRateOptimization, multiUser, apiAccess, customBranding"
}
```

---

## 4. New 403 Error Responses

All company-side create/send endpoints can now return these 403 errors. The frontend should check the `code` field.

### 4.1 Plan Limit Reached

```json
{
  "success": false,
  "error": "You have reached your monthly RFQ limit (50). Please upgrade your plan.",
  "code": "PLAN_LIMIT_REACHED",
  "limit": 50,
  "current": 50
}
```

**Affected endpoints:** `POST /rfqs`, `POST /contacts`, `POST /users`, `POST /emails/send`, `POST /emails/bulk`

### 4.2 Feature Not Available

```json
{
  "success": false,
  "error": "The \"Bulk Email\" feature is not available on your current plan. Please upgrade.",
  "code": "FEATURE_NOT_AVAILABLE",
  "feature": "bulkEmail"
}
```

**Affected endpoints:** See [Feature → Route Mapping](#5-feature--route-mapping) below.

### 4.3 Subscription Inactive

```json
{
  "success": false,
  "error": "Your subscription is not active. Please contact support.",
  "code": "SUBSCRIPTION_INACTIVE"
}
```

**Triggered when:** `company.subscriptionStatus` is not `ACTIVE` (e.g. `SUSPENDED`, `CANCELED`, `INACTIVE`).

---

## 5. Feature → Route Mapping

This table shows which feature flag gates which endpoint:

| Feature Key | Route(s) Gated | What It Blocks |
|-------------|---------------|----------------|
| `basicRFQ` | `POST /api/v1/rfqs` | Creating new RFQs |
| `basicQuotes` | `POST /api/v1/quotes` | Creating new quotes |
| `contactManagement` | `POST /api/v1/contacts` | Creating new contacts |
| `templateManagement` | `POST /api/v1/templates` | Creating new templates |
| `emailSupport` | `POST /api/v1/emails/send` | Sending individual emails |
| `bulkEmail` | `POST /api/v1/emails/bulk` | Sending bulk emails |
| `advancedAnalytics` | `GET /api/v1/analytics/carrier-performance` | Advanced analytics endpoints |
| | `GET /api/v1/analytics/route-performance` | |
| | `GET /api/v1/analytics/cost-analysis` | |
| | `GET /api/v1/analytics/market-intelligence` | |
| `scheduledReports` | `POST /api/v1/analytics/scheduled-reports` | Creating scheduled reports |
| `exportReports` | `POST /api/v1/analytics/export` | Exporting analytics data |
| `multiUser` | `POST /api/v1/users` | Inviting new users |

**Numeric limits** (separate from feature flags):

| Limit Field | Route Gated | Error When Exceeded |
|-------------|------------|---------------------|
| `maxRFQsPerMonth` | `POST /api/v1/rfqs` | Monthly RFQ count ≥ limit |
| `maxContacts` | `POST /api/v1/contacts` | Total contact count ≥ limit |
| `maxUsers` | `POST /api/v1/users` | Total user count ≥ limit |
| `maxEmailSendsPerMonth` | `POST /api/v1/emails/send`, `POST /api/v1/emails/bulk` | Monthly email count ≥ limit |

---

## 6. Quick Reference Table

| What | Endpoint | Side | Status |
|------|----------|------|--------|
| Feature registry (for plan form) | `GET /admin/subscription-plans/feature-registry` | Admin | **NEW** |
| Plan list (now has `featureSummary`) | `GET /admin/subscription-plans` | Admin | **CHANGED** |
| Plan detail (now has `resolvedFeatures`) | `GET /admin/subscription-plans/:id` | Admin | **CHANGED** |
| Plan create (features validated) | `POST /admin/subscription-plans` | Admin | **CHANGED** |
| Plan update (features validated) | `PUT /admin/subscription-plans/:id` | Admin | **CHANGED** |
| Company detail (now has `quoteStats` + `planDetails`) | `GET /admin/companies/:id` | Admin | **CHANGED** |
| Plan usage + quote analytics | `GET /analytics/plan-features` | Company | **NEW** |
| 403 limit/feature errors | All create/send routes | Company | **NEW** |

---

## Frontend Implementation Tips

1. **Plan Creation Form:** Call `GET /feature-registry` on mount, render grouped toggles by `category`. Pre-fill toggles with `defaultValue`.

2. **Plan Detail Page:** Use `resolvedFeatures` to show a grid of feature badges (green = enabled, gray = disabled). The `explicitlySet` flag tells you if the admin explicitly configured it or it's just the default.

3. **Company Dashboard:** Call `GET /analytics/plan-features` and render usage progress bars from `usage.*.percentage`. Show upgrade prompts when percentage > 80%.

4. **Error Handling:** On any **403** response, check the `code` field:
   - `PLAN_LIMIT_REACHED` → Show "You've reached your limit" modal with current/limit values
   - `FEATURE_NOT_AVAILABLE` → Show "Upgrade to unlock {feature}" modal
   - `SUBSCRIPTION_INACTIVE` → Redirect to billing/contact-support page
