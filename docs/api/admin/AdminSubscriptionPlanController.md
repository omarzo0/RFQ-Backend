# Admin Subscription Plan Controller

## Overview

Handles subscription plan management for admin users including creation, updates, deletion, and plan analytics.

## Endpoints

### 1. Get All Subscription Plans

**GET** `/api/v1/admin/subscription-plans`

**Description:** Get all subscription plans with filtering and pagination

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `isActive` (optional): Filter by active status (true/false)
- `search` (optional): Search by plan name or description

**Response:**

```json
{
  "success": true,
  "message": "Subscription plans retrieved successfully",
  "data": {
    "subscriptionPlans": [
      {
        "id": "plan_123",
        "name": "Premium Plan",
        "description": "Advanced features and priority support",
        "priceMonthly": 2999,
        "priceYearly": 29990,
        "currency": "USD",
        "features": [
          "Unlimited RFQs",
          "Advanced analytics",
          "Priority support",
          "Custom integrations"
        ],
        "isActive": true,
        "stripePriceId": "price_123",
        "stripeProductId": "prod_123",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

**Status Codes:**

- `200` - Subscription plans retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 2. Get Subscription Plan by ID

**GET** `/api/v1/admin/subscription-plans/:id`

**Description:** Get detailed information about a specific subscription plan

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**

- `id`: Subscription Plan ID

**Response:**

```json
{
  "success": true,
  "message": "Subscription plan retrieved successfully",
  "data": {
    "id": "plan_123",
    "name": "Premium Plan",
    "description": "Advanced features and priority support",
    "priceMonthly": 2999,
    "priceYearly": 29990,
    "currency": "USD",
    "features": [
      "Unlimited RFQs",
      "Advanced analytics",
      "Priority support",
      "Custom integrations"
    ],
    "isActive": true,
    "stripePriceId": "price_123",
    "stripeProductId": "prod_123",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "subscribers": {
      "total": 100,
      "active": 95,
      "trial": 5
    }
  }
}
```

**Status Codes:**

- `200` - Subscription plan retrieved successfully
- `401` - Unauthorized
- `404` - Subscription plan not found
- `500` - Internal server error

---

### 3. Create Subscription Plan

**POST** `/api/v1/admin/subscription-plans`

**Description:** Create a new subscription plan

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Enterprise Plan",
  "description": "Full-featured plan for large organizations",
  "priceMonthly": 9999,
  "priceYearly": 99990,
  "currency": "USD",
  "features": [
    "Unlimited everything",
    "Dedicated support",
    "Custom integrations",
    "Advanced security"
  ],
  "isActive": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Subscription plan created successfully",
  "data": {
    "id": "plan_456",
    "name": "Enterprise Plan",
    "description": "Full-featured plan for large organizations",
    "priceMonthly": 9999,
    "priceYearly": 99990,
    "currency": "USD",
    "features": [
      "Unlimited everything",
      "Dedicated support",
      "Custom integrations",
      "Advanced security"
    ],
    "isActive": true,
    "stripePriceId": "price_456",
    "stripeProductId": "prod_456",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `201` - Subscription plan created successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `409` - Plan already exists
- `500` - Internal server error

---

### 4. Update Subscription Plan

**PUT** `/api/v1/admin/subscription-plans/:id`

**Description:** Update an existing subscription plan

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: Subscription Plan ID

**Request Body:**

```json
{
  "name": "Updated Premium Plan",
  "description": "Updated description with new features",
  "priceMonthly": 3499,
  "priceYearly": 34990,
  "features": [
    "Unlimited RFQs",
    "Advanced analytics",
    "Priority support",
    "Custom integrations",
    "New feature"
  ],
  "isActive": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Subscription plan updated successfully",
  "data": {
    "id": "plan_123",
    "name": "Updated Premium Plan",
    "description": "Updated description with new features",
    "priceMonthly": 3499,
    "priceYearly": 34990,
    "currency": "USD",
    "features": [
      "Unlimited RFQs",
      "Advanced analytics",
      "Priority support",
      "Custom integrations",
      "New feature"
    ],
    "isActive": true,
    "stripePriceId": "price_123",
    "stripeProductId": "prod_123",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Subscription plan updated successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - Subscription plan not found
- `500` - Internal server error

---

### 5. Delete Subscription Plan

**DELETE** `/api/v1/admin/subscription-plans/:id`

**Description:** Delete a subscription plan (soft delete)

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**

- `id`: Subscription Plan ID

**Response:**

```json
{
  "success": true,
  "message": "Subscription plan deleted successfully",
  "data": {
    "id": "plan_123",
    "isActive": false,
    "deletedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Subscription plan deleted successfully
- `401` - Unauthorized
- `404` - Subscription plan not found
- `409` - Cannot delete plan with active subscribers
- `500` - Internal server error

---

### 6. Activate/Deactivate Subscription Plan

**PATCH** `/api/v1/admin/subscription-plans/:id/status`

**Description:** Activate or deactivate a subscription plan

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: Subscription Plan ID

**Request Body:**

```json
{
  "isActive": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Subscription plan status updated successfully",
  "data": {
    "id": "plan_123",
    "isActive": true,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Status updated successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - Subscription plan not found
- `500` - Internal server error

---

### 7. Get Plan Analytics

**GET** `/api/v1/admin/subscription-plans/:id/analytics`

**Description:** Get analytics for a specific subscription plan

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**

- `id`: Subscription Plan ID

**Query Parameters:**

- `period` (optional): Time period (30d, 90d, 1y)

**Response:**

```json
{
  "success": true,
  "message": "Plan analytics retrieved successfully",
  "data": {
    "plan": {
      "id": "plan_123",
      "name": "Premium Plan",
      "priceMonthly": 2999,
      "currency": "USD"
    },
    "subscribers": {
      "total": 100,
      "active": 95,
      "trial": 5,
      "churned": 10
    },
    "revenue": {
      "total": 300000,
      "monthly": 25000,
      "growth": 15.5
    },
    "conversion": {
      "trialToPaid": 85.5,
      "averageTrialDuration": 25,
      "retentionRate": 90.2
    },
    "trends": [
      {
        "month": "2024-01",
        "newSubscribers": 15,
        "churnedSubscribers": 5,
        "revenue": 20000
      },
      {
        "month": "2024-02",
        "newSubscribers": 20,
        "churnedSubscribers": 3,
        "revenue": 25000
      }
    ]
  }
}
```

**Status Codes:**

- `200` - Plan analytics retrieved successfully
- `401` - Unauthorized
- `404` - Subscription plan not found
- `500` - Internal server error

---

### 8. Get Plan Subscribers

**GET** `/api/v1/admin/subscription-plans/:id/subscribers`

**Description:** Get list of companies subscribed to a specific plan

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**

- `id`: Subscription Plan ID

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by subscription status

**Response:**

```json
{
  "success": true,
  "message": "Plan subscribers retrieved successfully",
  "data": {
    "subscribers": [
      {
        "companyId": "company_123",
        "companyName": "Tech Corp",
        "subscriptionStatus": "ACTIVE",
        "subscribedAt": "2024-01-01T00:00:00.000Z",
        "trialEndsAt": null,
        "lastPaymentDate": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    },
    "summary": {
      "totalSubscribers": 100,
      "activeSubscribers": 95,
      "trialSubscribers": 5
    }
  }
}
```

**Status Codes:**

- `200` - Plan subscribers retrieved successfully
- `401` - Unauthorized
- `404` - Subscription plan not found
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

## Notes

- All prices are in cents (e.g., 2999 = $29.99)
- Plan updates are synchronized with Stripe
- Deleted plans cannot be restored
- Plans with active subscribers cannot be deleted
- All plan operations are logged for audit
- Feature lists support markdown formatting
