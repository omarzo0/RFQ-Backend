# Admin Financial Controller

## Overview

Handles financial management and reporting for admin users including revenue tracking, transaction management, and financial analytics.

## Endpoints

### 1. Get Financial Details

**GET** `/api/v1/admin/financial`

**Description:** Get all financial details with filtering and pagination

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `companyId` (optional): Filter by company ID
- `sortBy` (optional): Sort field (default: totalRevenue)
- `sortOrder` (optional): Sort order - asc/desc (default: desc)

**Response:**

```json
{
  "success": true,
  "message": "Financial details retrieved successfully",
  "data": {
    "financialDetails": [
      {
        "id": "financial_123",
        "companyId": "company_123",
        "companyName": "Tech Corp",
        "totalRevenue": 50000,
        "monthlyRevenue": 5000,
        "totalTransactions": 100,
        "successfulTransactions": 95,
        "failedTransactions": 5,
        "averageTransactionValue": 500,
        "currency": "USD",
        "lastPaymentDate": "2024-01-01T00:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    },
    "summary": {
      "totalRevenue": 1000000,
      "totalCompanies": 100,
      "averageRevenuePerCompany": 10000,
      "currency": "USD"
    }
  }
}
```

**Status Codes:**

- `200` - Financial details retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 2. Get Company Financial Details

**GET** `/api/v1/admin/financial/company/:companyId`

**Description:** Get detailed financial information for a specific company

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**

- `companyId`: Company ID

**Response:**

```json
{
  "success": true,
  "message": "Company financial details retrieved successfully",
  "data": {
    "company": {
      "id": "company_123",
      "name": "Tech Corp",
      "email": "contact@techcorp.com",
      "subscriptionPlan": "premium",
      "subscriptionStatus": "ACTIVE"
    },
    "financialDetails": {
      "id": "financial_123",
      "totalRevenue": 50000,
      "monthlyRevenue": 5000,
      "totalTransactions": 100,
      "successfulTransactions": 95,
      "failedTransactions": 5,
      "averageTransactionValue": 500,
      "currency": "USD",
      "lastPaymentDate": "2024-01-01T00:00:00.000Z"
    },
    "transactions": [
      {
        "id": "transaction_123",
        "amount": 2999,
        "currency": "USD",
        "status": "succeeded",
        "description": "Premium plan subscription",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "revenueTrend": [
      {
        "month": "2024-01",
        "revenue": 4000
      },
      {
        "month": "2024-02",
        "revenue": 5000
      }
    ]
  }
}
```

**Status Codes:**

- `200` - Company financial details retrieved successfully
- `401` - Unauthorized
- `404` - Company not found
- `500` - Internal server error

---

### 3. Get Revenue Analytics

**GET** `/api/v1/admin/financial/revenue-analytics`

**Description:** Get comprehensive revenue analytics

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
  "message": "Revenue analytics retrieved successfully",
  "data": {
    "totalRevenue": 1000000,
    "periodRevenue": 50000,
    "revenueGrowth": 25.8,
    "currency": "USD",
    "revenueByPlan": [
      {
        "plan": "premium",
        "revenue": 600000,
        "percentage": 60,
        "subscribers": 200
      },
      {
        "plan": "basic",
        "revenue": 400000,
        "percentage": 40,
        "subscribers": 400
      }
    ],
    "monthlyTrend": [
      {
        "month": "2024-01",
        "revenue": 35000,
        "transactions": 70
      },
      {
        "month": "2024-02",
        "revenue": 42000,
        "transactions": 84
      }
    ],
    "topCompanies": [
      {
        "companyId": "company_123",
        "companyName": "Tech Corp",
        "revenue": 50000,
        "percentage": 10
      }
    ],
    "projectedRevenue": {
      "nextMonth": 55000,
      "nextQuarter": 165000
    }
  }
}
```

**Status Codes:**

- `200` - Revenue analytics retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 4. Get Transaction Analytics

**GET** `/api/v1/admin/financial/transaction-analytics`

**Description:** Get transaction analytics and trends

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `period` (optional): Time period (7d, 30d, 90d, 1y)
- `status` (optional): Filter by transaction status

**Response:**

```json
{
  "success": true,
  "message": "Transaction analytics retrieved successfully",
  "data": {
    "totalTransactions": 10000,
    "successfulTransactions": 9500,
    "failedTransactions": 500,
    "successRate": 95,
    "averageTransactionValue": 500,
    "currency": "USD",
    "transactionTrends": [
      {
        "date": "2024-01-01",
        "total": 100,
        "successful": 95,
        "failed": 5
      },
      {
        "date": "2024-01-02",
        "total": 120,
        "successful": 115,
        "failed": 5
      }
    ],
    "transactionsByStatus": [
      {
        "status": "succeeded",
        "count": 9500,
        "percentage": 95
      },
      {
        "status": "failed",
        "count": 500,
        "percentage": 5
      }
    ],
    "transactionsByPlan": [
      {
        "plan": "premium",
        "count": 6000,
        "averageValue": 800
      },
      {
        "plan": "basic",
        "count": 4000,
        "averageValue": 200
      }
    ]
  }
}
```

**Status Codes:**

- `200` - Transaction analytics retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 5. Get Financial Summary

**GET** `/api/v1/admin/financial/summary`

**Description:** Get overall financial summary

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Financial summary retrieved successfully",
  "data": {
    "overview": {
      "totalRevenue": 1000000,
      "monthlyRevenue": 50000,
      "totalTransactions": 10000,
      "activeSubscriptions": 600,
      "currency": "USD"
    },
    "growth": {
      "revenueGrowth": 25.8,
      "transactionGrowth": 15.2,
      "subscriptionGrowth": 20.5
    },
    "metrics": {
      "averageRevenuePerUser": 1666.67,
      "averageTransactionValue": 100,
      "churnRate": 5.2,
      "lifetimeValue": 2000
    },
    "topPerformers": [
      {
        "companyId": "company_123",
        "companyName": "Tech Corp",
        "revenue": 50000,
        "growth": 30.5
      }
    ]
  }
}
```

**Status Codes:**

- `200` - Financial summary retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 6. Get Revenue by Plan

**GET** `/api/v1/admin/financial/revenue-by-plan`

**Description:** Get revenue breakdown by subscription plan

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
  "message": "Revenue by plan retrieved successfully",
  "data": {
    "plans": [
      {
        "planId": "plan_premium",
        "planName": "Premium Plan",
        "revenue": 600000,
        "percentage": 60,
        "subscribers": 200,
        "averageRevenuePerUser": 3000,
        "monthlyRecurringRevenue": 50000
      },
      {
        "planId": "plan_basic",
        "planName": "Basic Plan",
        "revenue": 400000,
        "percentage": 40,
        "subscribers": 400,
        "averageRevenuePerUser": 1000,
        "monthlyRecurringRevenue": 33333
      }
    ],
    "totalRevenue": 1000000,
    "totalSubscribers": 600,
    "averageRevenuePerUser": 1666.67
  }
}
```

**Status Codes:**

- `200` - Revenue by plan retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 7. Get Financial Trends

**GET** `/api/v1/admin/financial/trends`

**Description:** Get financial trends and forecasting

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `period` (optional): Time period (30d, 90d, 1y)
- `forecast` (optional): Include forecasting (true/false)

**Response:**

```json
{
  "success": true,
  "message": "Financial trends retrieved successfully",
  "data": {
    "revenueTrend": [
      {
        "month": "2024-01",
        "revenue": 35000,
        "transactions": 70
      },
      {
        "month": "2024-02",
        "revenue": 42000,
        "transactions": 84
      }
    ],
    "growthTrend": [
      {
        "month": "2024-01",
        "growth": 15.2
      },
      {
        "month": "2024-02",
        "growth": 20.0
      }
    ],
    "forecast": {
      "nextMonth": 50000,
      "nextQuarter": 150000,
      "nextYear": 600000,
      "confidence": 85.5
    },
    "seasonality": {
      "peakMonth": "December",
      "lowMonth": "January",
      "seasonalFactor": 1.2
    }
  }
}
```

**Status Codes:**

- `200` - Financial trends retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 8. Export Financial Data

**GET** `/api/v1/admin/financial/export`

**Description:** Export financial data to CSV/Excel

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `format` (optional): Export format - csv/excel (default: csv)
- `startDate` (optional): Start date (ISO format)
- `endDate` (optional): End date (ISO format)
- `companyId` (optional): Filter by company ID

**Response:**

```json
{
  "success": true,
  "message": "Financial data export initiated successfully",
  "data": {
    "exportId": "export_123",
    "status": "processing",
    "downloadUrl": "https://yourdomain.com/exports/financial_123.csv",
    "expiresAt": "2024-01-02T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Export initiated successfully
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
  "statusCode": 500
}
```

## Authentication

All endpoints require a valid admin JWT token in the Authorization header:

```
Authorization: Bearer <admin_jwt_token>
```

## Notes

- All financial data is calculated in real-time
- Revenue data is aggregated by company and subscription plan
- Historical data is available for up to 2 years
- Export files are available for 24 hours
- All amounts are in the base currency (USD)
- Financial calculations include taxes and fees
