# Company Payment Controller

## Overview

Handles payment operations for company users including payment intents, subscriptions, refunds, and financial management.

## Endpoints

### 1. Create Payment Intent

**POST** `/api/v1/company/payments/intent`

**Description:** Create a payment intent for one-time payments

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "amount": 2999,
  "currency": "usd",
  "description": "Payment for premium plan",
  "metadata": {
    "orderId": "order_123"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Payment intent created successfully",
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx",
    "amount": 2999,
    "currency": "usd",
    "status": "requires_payment_method"
  }
}
```

**Status Codes:**

- `200` - Payment intent created successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `500` - Internal server error

---

### 2. Upgrade Subscription

**POST** `/api/v1/company/payments/upgrade`

**Description:** Upgrade from trial to paid subscription plan

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "priceId": "price_xxx",
  "paymentMethodId": "pm_xxx"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Subscription upgraded successfully",
  "data": {
    "subscriptionId": "sub_xxx",
    "status": "active",
    "clientSecret": "pi_xxx_secret_xxx",
    "currentPeriodStart": 1640995200,
    "currentPeriodEnd": 1643673600
  }
}
```

**Status Codes:**

- `200` - Subscription upgraded successfully
- `400` - Invalid input data or not on trial plan
- `401` - Unauthorized
- `500` - Internal server error

---

### 3. Update Subscription

**PUT** `/api/v1/company/payments/subscription/:subscriptionId`

**Description:** Update an existing subscription

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `subscriptionId`: Subscription ID

**Request Body:**

```json
{
  "priceId": "price_xxx",
  "quantity": 2,
  "prorationBehavior": "create_prorations"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Subscription updated successfully",
  "data": {
    "subscriptionId": "sub_xxx",
    "status": "active",
    "currentPeriodStart": 1640995200,
    "currentPeriodEnd": 1643673600
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

**DELETE** `/api/v1/company/payments/subscription/:subscriptionId`

**Description:** Cancel a subscription

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `subscriptionId`: Subscription ID

**Request Body:**

```json
{
  "immediately": false
}
```

**Response:**

```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "data": {
    "subscriptionId": "sub_xxx",
    "status": "canceled",
    "canceledAt": 1640995200,
    "cancelAtPeriodEnd": true
  }
}
```

**Status Codes:**

- `200` - Subscription cancelled successfully
- `401` - Unauthorized
- `404` - Subscription not found
- `500` - Internal server error

---

### 5. Get Payment Methods

**GET** `/api/v1/company/payments/methods`

**Description:** Get company's saved payment methods

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Payment methods retrieved successfully",
  "data": {
    "paymentMethods": [
      {
        "id": "pm_xxx",
        "type": "card",
        "card": {
          "brand": "visa",
          "last4": "4242",
          "expMonth": 12,
          "expYear": 2025
        },
        "isDefault": true
      }
    ]
  }
}
```

**Status Codes:**

- `200` - Payment methods retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 6. Create Setup Intent

**POST** `/api/v1/company/payments/setup-intent`

**Description:** Create a setup intent for saving payment methods

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Setup intent created successfully",
  "data": {
    "clientSecret": "seti_xxx_secret_xxx",
    "setupIntentId": "seti_xxx"
  }
}
```

**Status Codes:**

- `200` - Setup intent created successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 7. Get Subscription Details

**GET** `/api/v1/company/payments/subscription/:subscriptionId`

**Description:** Get detailed subscription information

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Path Parameters:**

- `subscriptionId`: Subscription ID

**Response:**

```json
{
  "success": true,
  "message": "Subscription retrieved successfully",
  "data": {
    "id": "sub_xxx",
    "status": "active",
    "currentPeriodStart": 1640995200,
    "currentPeriodEnd": 1643673600,
    "trialEnd": null,
    "cancelAtPeriodEnd": false,
    "canceledAt": null,
    "defaultPaymentMethod": "pm_xxx",
    "items": [
      {
        "id": "si_xxx",
        "price": {
          "id": "price_xxx",
          "unitAmount": 2999,
          "currency": "usd",
          "recurring": {
            "interval": "month"
          }
        },
        "quantity": 1
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

### 8. Get Company Subscriptions

**GET** `/api/v1/company/payments/subscriptions`

**Description:** Get all company's subscriptions

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Subscriptions retrieved successfully",
  "data": {
    "subscriptions": [
      {
        "id": "sub_xxx",
        "status": "active",
        "currentPeriodStart": 1640995200,
        "currentPeriodEnd": 1643673600,
        "trialEnd": null,
        "cancelAtPeriodEnd": false,
        "canceledAt": null,
        "defaultPaymentMethod": "pm_xxx",
        "items": []
      }
    ]
  }
}
```

**Status Codes:**

- `200` - Subscriptions retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 9. Process Refund

**POST** `/api/v1/company/payments/refund/:paymentIntentId`

**Description:** Process a refund for a payment

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `paymentIntentId`: Payment Intent ID

**Request Body:**

```json
{
  "amount": 1000,
  "reason": "requested_by_customer"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Refund processed successfully",
  "data": {
    "refundId": "re_xxx",
    "amount": 1000,
    "currency": "usd",
    "status": "succeeded",
    "reason": "requested_by_customer"
  }
}
```

**Status Codes:**

- `200` - Refund processed successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - Payment intent not found
- `500` - Internal server error

---

### 10. Get Company Transactions

**GET** `/api/v1/company/payments/transactions`

**Description:** Get company's transaction history

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Query Parameters:**

- `limit` (optional): Number of transactions to return (default: 50)
- `offset` (optional): Number of transactions to skip (default: 0)

**Response:**

```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": {
    "transactions": [
      {
        "id": "pi_xxx",
        "amount": 2999,
        "currency": "usd",
        "status": "succeeded",
        "description": "Premium plan subscription",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "limit": 50,
      "offset": 0,
      "total": 100
    }
  }
}
```

**Status Codes:**

- `200` - Transactions retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 11. Get Financial Summary

**GET** `/api/v1/company/payments/financial-summary`

**Description:** Get company's financial summary

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Financial summary retrieved successfully",
  "data": {
    "totalRevenue": 50000,
    "currency": "usd",
    "monthlyRevenue": 15000,
    "totalTransactions": 100,
    "successfulTransactions": 95,
    "failedTransactions": 5,
    "averageTransactionValue": 500,
    "lastPaymentDate": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Financial summary retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 12. Get Available Plans

**GET** `/api/v1/company/payments/plans`

**Description:** Get available subscription plans for upgrade

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Available plans retrieved successfully",
  "data": {
    "plans": [
      {
        "id": "price_xxx",
        "name": "Premium Plan",
        "description": "Advanced features and support",
        "priceMonthly": 2999,
        "priceYearly": 29990,
        "currency": "usd",
        "features": [
          "Unlimited RFQs",
          "Advanced analytics",
          "Priority support"
        ],
        "isActive": true
      }
    ]
  }
}
```

**Status Codes:**

- `200` - Plans retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 13. Get Subscription Status

**GET** `/api/v1/company/payments/status`

**Description:** Get company's current subscription status

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Subscription status retrieved successfully",
  "data": {
    "status": {
      "currentPlan": "trial",
      "status": "ACTIVE",
      "trialEndsAt": "2024-02-01T00:00:00.000Z",
      "isTrialExpired": false,
      "daysLeftInTrial": 15,
      "canUpgrade": true,
      "hasStripeCustomer": true
    }
  }
}
```

**Status Codes:**

- `200` - Status retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 14. Stripe Webhook

**POST** `/api/v1/company/payments/webhook`

**Description:** Handle Stripe webhook events

**Headers:**

```
stripe-signature: <webhook_signature>
Content-Type: application/json
```

**Request Body:**

```json
{
  "id": "evt_xxx",
  "object": "event",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_xxx",
      "amount": 2999,
      "currency": "usd",
      "status": "succeeded"
    }
  }
}
```

**Response:**

```json
{
  "received": true
}
```

**Status Codes:**

- `200` - Webhook processed successfully
- `400` - Invalid webhook signature
- `500` - Webhook processing failed

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

Most endpoints require a valid company JWT token in the Authorization header:

```
Authorization: Bearer <company_jwt_token>
```

## Notes

- All amounts are in cents (e.g., 2999 = $29.99)
- Webhook endpoint is public and doesn't require authentication
- Subscription upgrades are only allowed from trial plans
- All payment operations are logged for audit purposes
- Email notifications are sent for payment confirmations and receipts
