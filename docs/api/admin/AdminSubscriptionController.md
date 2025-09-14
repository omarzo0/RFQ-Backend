# Admin Subscription Controller

## Overview

Handles subscription management for admin users including viewing, updating, and monitoring company subscriptions.

## Endpoints

### 1. Get All Subscriptions

**GET** `/api/v1/admin/subscriptions`

**Description:** Get all subscriptions with filtering and pagination

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by subscription status
- `plan` (optional): Filter by subscription plan
- `search` (optional): Search by company name or email

**Response:**

```json
{
  "success": true,
  "message": "Subscriptions retrieved successfully",
  "data": {
    "subscriptions": [
      {
        "id": "subscription_123",
        "companyId": "company_123",
        "companyName": "Tech Corp",
        "companyEmail": "contact@techcorp.com",
        "subscriptionPlan": "premium",
        "subscriptionStatus": "ACTIVE",
        "trialEndsAt": null,
        "currentPeriodStart": "2024-01-01T00:00:00.000Z",
        "currentPeriodEnd": "2024-02-01T00:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 300,
      "totalPages": 15
    },
    "summary": {
      "total": 300,
      "active": 250,
      "trial": 50,
      "cancelled": 0
    }
  }
}
```

**Status Codes:**

- `200` - Subscriptions retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 2. Get Subscription by ID

**GET** `/api/v1/admin/subscriptions/:id`

**Description:** Get detailed information about a specific subscription

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**

- `id`: Subscription ID

**Response:**

```json
{
  "success": true,
  "message": "Subscription retrieved successfully",
  "data": {
    "subscription": {
      "id": "subscription_123",
      "companyId": "company_123",
      "companyName": "Tech Corp",
      "companyEmail": "contact@techcorp.com",
      "subscriptionPlan": "premium",
      "subscriptionStatus": "ACTIVE",
      "trialEndsAt": null,
      "currentPeriodStart": "2024-01-01T00:00:00.000Z",
      "currentPeriodEnd": "2024-02-01T00:00:00.000Z",
      "stripeSubscriptionId": "sub_123",
      "stripeCustomerId": "cus_123",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "company": {
      "id": "company_123",
      "name": "Tech Corp",
      "email": "contact@techcorp.com",
      "phone": "+1234567890",
      "address": "123 Tech St, City, State",
      "website": "https://techcorp.com",
      "industry": "Technology",
      "size": "50-100"
    },
    "paymentHistory": [
      {
        "id": "payment_123",
        "amount": 2999,
        "currency": "USD",
        "status": "succeeded",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

**Status Codes:**

- `200` - Subscription retrieved successfully
- `401` - Unauthorized
- `404` - Subscription not found
- `500` - Internal server error

---

### 3. Update Subscription

**PUT** `/api/v1/admin/subscriptions/:id`

**Description:** Update a subscription

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: Subscription ID

**Request Body:**

```json
{
  "subscriptionPlan": "enterprise",
  "subscriptionStatus": "ACTIVE",
  "trialEndsAt": "2024-02-01T00:00:00.000Z"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Subscription updated successfully",
  "data": {
    "id": "subscription_123",
    "subscriptionPlan": "enterprise",
    "subscriptionStatus": "ACTIVE",
    "trialEndsAt": "2024-02-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Subscription updated successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - Subscription not found
- `500` - Internal server error

---

### 4. Cancel Subscription

**DELETE** `/api/v1/admin/subscriptions/:id`

**Description:** Cancel a subscription

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: Subscription ID

**Request Body:**

```json
{
  "reason": "Company requested cancellation",
  "immediately": false
}
```

**Response:**

```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "data": {
    "id": "subscription_123",
    "subscriptionStatus": "CANCELLED",
    "cancelledAt": "2024-01-01T12:00:00.000Z",
    "cancelAtPeriodEnd": true,
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Subscription cancelled successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - Subscription not found
- `500` - Internal server error

---

### 5. Get Subscription Analytics

**GET** `/api/v1/admin/subscriptions/analytics`

**Description:** Get subscription analytics and trends

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `period` (optional): Time period (30d, 90d, 1y)

**Response:**

```json
{
  "success": true,
  "message": "Subscription analytics retrieved successfully",
  "data": {
    "overview": {
      "totalSubscriptions": 300,
      "activeSubscriptions": 250,
      "trialSubscriptions": 50,
      "cancelledSubscriptions": 0,
      "trialConversionRate": 83.3
    },
    "byPlan": [
      {
        "plan": "premium",
        "count": 150,
        "percentage": 50,
        "revenue": 450000
      },
      {
        "plan": "basic",
        "count": 100,
        "percentage": 33.3,
        "revenue": 200000
      },
      {
        "plan": "trial",
        "count": 50,
        "percentage": 16.7,
        "revenue": 0
      }
    ],
    "trends": [
      {
        "month": "2024-01",
        "newSubscriptions": 20,
        "cancelledSubscriptions": 5,
        "netGrowth": 15
      },
      {
        "month": "2024-02",
        "newSubscriptions": 25,
        "cancelledSubscriptions": 3,
        "netGrowth": 22
      }
    ],
    "churnAnalysis": {
      "monthlyChurnRate": 2.5,
      "annualChurnRate": 30,
      "averageLifetime": 24,
      "retentionRate": 97.5
    }
  }
}
```

**Status Codes:**

- `200` - Analytics retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 6. Get Trial Subscriptions

**GET** `/api/v1/admin/subscriptions/trials`

**Description:** Get all trial subscriptions

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `expiringSoon` (optional): Filter by expiring soon (true/false)

**Response:**

```json
{
  "success": true,
  "message": "Trial subscriptions retrieved successfully",
  "data": {
    "subscriptions": [
      {
        "id": "subscription_123",
        "companyId": "company_123",
        "companyName": "Tech Corp",
        "companyEmail": "contact@techcorp.com",
        "subscriptionPlan": "trial",
        "subscriptionStatus": "ACTIVE",
        "trialEndsAt": "2024-01-15T00:00:00.000Z",
        "daysLeft": 5,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    },
    "summary": {
      "total": 50,
      "expiringSoon": 10,
      "expired": 5,
      "active": 35
    }
  }
}
```

**Status Codes:**

- `200` - Trial subscriptions retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 7. Extend Trial

**PUT** `/api/v1/admin/subscriptions/:id/extend-trial`

**Description:** Extend a trial subscription

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: Subscription ID

**Request Body:**

```json
{
  "extensionDays": 30,
  "reason": "Company requested extension"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Trial extended successfully",
  "data": {
    "id": "subscription_123",
    "trialEndsAt": "2024-02-15T00:00:00.000Z",
    "extensionDays": 30,
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Trial extended successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - Subscription not found
- `409` - Cannot extend non-trial subscription
- `500` - Internal server error

---

### 8. Get Subscription Statistics

**GET** `/api/v1/admin/subscriptions/statistics`

**Description:** Get subscription statistics and metrics

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Subscription statistics retrieved successfully",
  "data": {
    "overview": {
      "totalSubscriptions": 300,
      "activeSubscriptions": 250,
      "trialSubscriptions": 50,
      "monthlyRecurringRevenue": 65000,
      "annualRecurringRevenue": 780000
    },
    "conversion": {
      "trialToPaid": 83.3,
      "averageTrialDuration": 25,
      "conversionByPlan": [
        {
          "plan": "premium",
          "conversionRate": 85.5
        },
        {
          "plan": "basic",
          "conversionRate": 80.0
        }
      ]
    },
    "retention": {
      "monthlyRetention": 97.5,
      "quarterlyRetention": 92.0,
      "annualRetention": 85.0,
      "averageLifetime": 24
    },
    "revenue": {
      "totalRevenue": 1000000,
      "monthlyRevenue": 65000,
      "revenueGrowth": 25.8,
      "averageRevenuePerUser": 3333.33
    }
  }
}
```

**Status Codes:**

- `200` - Statistics retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

## Error Responses

All endpoints may return the following error structure:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "statusCode": 400
}
```

## Authentication

All endpoints require a valid admin JWT token in the Authorization header:

```
Authorization: Bearer <admin_jwt_token>
```

## Subscription Statuses

- **ACTIVE**: Subscription is active and billing
- **TRIAL**: Company is on trial
- **CANCELLED**: Subscription has been cancelled
- **PAST_DUE**: Payment failed, subscription is past due
- **UNPAID**: Subscription is unpaid

## Notes

- All subscription operations are synchronized with Stripe
- Trial extensions are logged for audit purposes
- Subscription changes trigger email notifications
- All subscription data is real-time
- Cancelled subscriptions can be reactivated
