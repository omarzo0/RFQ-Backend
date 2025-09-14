# Admin Transaction Controller

## Overview

Handles transaction management and reporting for admin users including transaction viewing, filtering, and analytics.

## Endpoints

### 1. Get All Transactions

**GET** `/api/v1/admin/transactions`

**Description:** Get all transactions with filtering and pagination

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by transaction status
- `type` (optional): Filter by transaction type
- `companyId` (optional): Filter by company ID
- `dateFrom` (optional): Start date (ISO format)
- `dateTo` (optional): End date (ISO format)
- `search` (optional): Search by description or ID

**Response:**

```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": {
    "transactions": [
      {
        "id": "transaction_123",
        "stripeTransactionId": "pi_123",
        "companyId": "company_123",
        "companyName": "Tech Corp",
        "amount": 2999,
        "currency": "USD",
        "status": "succeeded",
        "type": "subscription",
        "description": "Premium plan subscription",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1000,
      "totalPages": 50
    },
    "summary": {
      "totalAmount": 500000,
      "totalTransactions": 1000,
      "successfulTransactions": 950,
      "failedTransactions": 50,
      "currency": "USD"
    }
  }
}
```

**Status Codes:**

- `200` - Transactions retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 2. Get Transaction by ID

**GET** `/api/v1/admin/transactions/:id`

**Description:** Get detailed information about a specific transaction

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**

- `id`: Transaction ID

**Response:**

```json
{
  "success": true,
  "message": "Transaction retrieved successfully",
  "data": {
    "id": "transaction_123",
    "stripeTransactionId": "pi_123",
    "companyId": "company_123",
    "companyName": "Tech Corp",
    "companyEmail": "contact@techcorp.com",
    "amount": 2999,
    "currency": "USD",
    "status": "succeeded",
    "type": "subscription",
    "description": "Premium plan subscription",
    "paymentMethod": {
      "id": "pm_123",
      "type": "card",
      "last4": "4242",
      "brand": "visa"
    },
    "stripeData": {
      "paymentIntentId": "pi_123",
      "chargeId": "ch_123",
      "invoiceId": "in_123"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Transaction retrieved successfully
- `401` - Unauthorized
- `404` - Transaction not found
- `500` - Internal server error

---

### 3. Get Transaction Analytics

**GET** `/api/v1/admin/transactions/analytics`

**Description:** Get transaction analytics and trends

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `period` (optional): Time period (7d, 30d, 90d, 1y)
- `startDate` (optional): Start date (ISO format)
- `endDate` (optional): End date (ISO format)

**Response:**

```json
{
  "success": true,
  "message": "Transaction analytics retrieved successfully",
  "data": {
    "overview": {
      "totalTransactions": 10000,
      "totalAmount": 5000000,
      "successRate": 95.5,
      "averageTransactionValue": 500,
      "currency": "USD"
    },
    "trends": [
      {
        "date": "2024-01-01",
        "transactions": 100,
        "amount": 50000,
        "successRate": 96
      },
      {
        "date": "2024-01-02",
        "transactions": 120,
        "amount": 60000,
        "successRate": 95
      }
    ],
    "byStatus": [
      {
        "status": "succeeded",
        "count": 9500,
        "amount": 4750000,
        "percentage": 95
      },
      {
        "status": "failed",
        "count": 500,
        "amount": 250000,
        "percentage": 5
      }
    ],
    "byType": [
      {
        "type": "subscription",
        "count": 8000,
        "amount": 4000000,
        "percentage": 80
      },
      {
        "type": "one_time",
        "count": 2000,
        "amount": 1000000,
        "percentage": 20
      }
    ],
    "topCompanies": [
      {
        "companyId": "company_123",
        "companyName": "Tech Corp",
        "transactionCount": 100,
        "totalAmount": 50000
      }
    ]
  }
}
```

**Status Codes:**

- `200` - Analytics retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 4. Get Company Transactions

**GET** `/api/v1/admin/transactions/company/:companyId`

**Description:** Get all transactions for a specific company

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**

- `companyId`: Company ID

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by transaction status
- `type` (optional): Filter by transaction type

**Response:**

```json
{
  "success": true,
  "message": "Company transactions retrieved successfully",
  "data": {
    "company": {
      "id": "company_123",
      "name": "Tech Corp",
      "email": "contact@techcorp.com",
      "subscriptionPlan": "premium"
    },
    "transactions": [
      {
        "id": "transaction_123",
        "amount": 2999,
        "currency": "USD",
        "status": "succeeded",
        "type": "subscription",
        "description": "Premium plan subscription",
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
      "totalAmount": 150000,
      "totalTransactions": 50,
      "successfulTransactions": 48,
      "failedTransactions": 2
    }
  }
}
```

**Status Codes:**

- `200` - Company transactions retrieved successfully
- `401` - Unauthorized
- `404` - Company not found
- `500` - Internal server error

---

### 5. Get Transaction Summary

**GET** `/api/v1/admin/transactions/summary`

**Description:** Get overall transaction summary

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `period` (optional): Time period (7d, 30d, 90d, 1y)

**Response:**

```json
{
  "success": true,
  "message": "Transaction summary retrieved successfully",
  "data": {
    "totalRevenue": 5000000,
    "monthlyRevenue": 500000,
    "revenueGrowth": 25.8,
    "currency": "USD",
    "transactionCounts": {
      "total": 10000,
      "successful": 9500,
      "failed": 500,
      "pending": 0
    },
    "averageValues": {
      "transactionValue": 500,
      "monthlyPerCompany": 2500,
      "lifetimePerCompany": 15000
    },
    "conversionRates": {
      "trialToPaid": 85.5,
      "subscriptionRetention": 92.3,
      "paymentSuccess": 95.5
    },
    "topPerformingPlans": [
      {
        "plan": "premium",
        "revenue": 3000000,
        "transactions": 6000,
        "averageValue": 500
      },
      {
        "plan": "basic",
        "revenue": 2000000,
        "transactions": 4000,
        "averageValue": 500
      }
    ]
  }
}
```

**Status Codes:**

- `200` - Summary retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 6. Export Transactions

**GET** `/api/v1/admin/transactions/export`

**Description:** Export transactions to CSV/Excel

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `format` (optional): Export format - csv/excel (default: csv)
- `startDate` (optional): Start date (ISO format)
- `endDate` (optional): End date (ISO format)
- `companyId` (optional): Filter by company ID
- `status` (optional): Filter by transaction status

**Response:**

```json
{
  "success": true,
  "message": "Transaction export initiated successfully",
  "data": {
    "exportId": "export_123",
    "status": "processing",
    "downloadUrl": "https://yourdomain.com/exports/transactions_123.csv",
    "expiresAt": "2024-01-02T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Export initiated successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 7. Get Failed Transactions

**GET** `/api/v1/admin/transactions/failed`

**Description:** Get all failed transactions for investigation

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `dateFrom` (optional): Start date (ISO format)
- `dateTo` (optional): End date (ISO format)

**Response:**

```json
{
  "success": true,
  "message": "Failed transactions retrieved successfully",
  "data": {
    "transactions": [
      {
        "id": "transaction_456",
        "stripeTransactionId": "pi_456",
        "companyId": "company_123",
        "companyName": "Tech Corp",
        "amount": 2999,
        "currency": "USD",
        "status": "failed",
        "type": "subscription",
        "description": "Premium plan subscription",
        "failureReason": "insufficient_funds",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    },
    "failureReasons": [
      {
        "reason": "insufficient_funds",
        "count": 30,
        "percentage": 60
      },
      {
        "reason": "card_declined",
        "count": 20,
        "percentage": 40
      }
    ]
  }
}
```

**Status Codes:**

- `200` - Failed transactions retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 8. Retry Failed Transaction

**POST** `/api/v1/admin/transactions/:id/retry`

**Description:** Retry a failed transaction

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: Transaction ID

**Request Body:**

```json
{
  "reason": "Retrying after payment method update"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Transaction retry initiated successfully",
  "data": {
    "id": "transaction_456",
    "status": "pending",
    "retryAttempt": 2,
    "retryReason": "Retrying after payment method update",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Retry initiated successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - Transaction not found
- `409` - Transaction cannot be retried
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

## Transaction Statuses

- **pending**: Transaction is being processed
- **succeeded**: Transaction completed successfully
- **failed**: Transaction failed
- **canceled**: Transaction was canceled
- **refunded**: Transaction was refunded

## Transaction Types

- **subscription**: Recurring subscription payment
- **one_time**: One-time payment
- **refund**: Refund transaction
- **setup**: Payment method setup

## Notes

- All transaction data is synchronized with Stripe
- Failed transactions include detailed failure reasons
- Export files are available for 24 hours
- Transaction retries are limited to prevent abuse
- All amounts are in cents (e.g., 2999 = $29.99)
