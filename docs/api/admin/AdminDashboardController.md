# Admin Dashboard Controller

## Overview

Handles admin dashboard data and statistics including comprehensive metrics, company details, and system overview.

## Endpoints

### 1. Get Dashboard Data

**GET** `/api/v1/admin/dashboard`

**Description:** Get comprehensive dashboard data with key metrics

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "overview": {
      "totalCompanies": 150,
      "activeCompanies": 140,
      "trialCompanies": 30,
      "totalUsers": 500,
      "activeUsers": 450,
      "totalRFQs": 2500,
      "totalQuotes": 5000,
      "totalRevenue": 500000
    },
    "recentActivity": [
      {
        "type": "company_created",
        "message": "New company 'Tech Corp' registered",
        "timestamp": "2024-01-01T10:30:00.000Z",
        "companyId": "company_123"
      },
      {
        "type": "subscription_upgraded",
        "message": "Company 'ABC Ltd' upgraded to premium plan",
        "timestamp": "2024-01-01T09:15:00.000Z",
        "companyId": "company_456"
      }
    ],
    "metrics": {
      "revenue": {
        "current": 45000,
        "previous": 40000,
        "growth": 12.5,
        "currency": "USD"
      },
      "companies": {
        "current": 150,
        "previous": 140,
        "growth": 7.1
      },
      "users": {
        "current": 500,
        "previous": 450,
        "growth": 11.1
      }
    },
    "charts": {
      "revenueTrend": [
        {
          "month": "2024-01",
          "revenue": 35000
        },
        {
          "month": "2024-02",
          "revenue": 42000
        }
      ],
      "companyGrowth": [
        {
          "month": "2024-01",
          "newCompanies": 15
        },
        {
          "month": "2024-02",
          "newCompanies": 20
        }
      ]
    }
  }
}
```

**Status Codes:**

- `200` - Data retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 2. Get Company Details

**GET** `/api/v1/admin/companies/:id/details`

**Description:** Get detailed information about a specific company

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**

- `id`: Company ID

**Response:**

```json
{
  "success": true,
  "message": "Company details retrieved successfully",
  "data": {
    "company": {
      "id": "company_123",
      "name": "Tech Corp",
      "email": "contact@techcorp.com",
      "phone": "+1234567890",
      "address": "123 Tech St, City, State",
      "website": "https://techcorp.com",
      "industry": "Technology",
      "size": "50-100",
      "subscriptionPlan": "premium",
      "subscriptionStatus": "ACTIVE",
      "trialEndsAt": null,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "users": [
      {
        "id": "user_123",
        "email": "admin@techcorp.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "admin",
        "isActive": true,
        "lastLogin": "2024-01-01T10:30:00.000Z"
      }
    ],
    "statistics": {
      "totalRFQs": 25,
      "activeRFQs": 5,
      "completedRFQs": 18,
      "totalQuotes": 50,
      "sentQuotes": 45,
      "acceptedQuotes": 12,
      "totalRevenue": 15000,
      "lastActivity": "2024-01-01T10:30:00.000Z"
    },
    "recentActivity": [
      {
        "type": "rfq_created",
        "message": "New RFQ created",
        "timestamp": "2024-01-01T10:30:00.000Z",
        "rfqId": "rfq_123"
      },
      {
        "type": "quote_sent",
        "message": "Quote sent to customer",
        "timestamp": "2024-01-01T09:15:00.000Z",
        "quoteId": "quote_456"
      }
    ]
  }
}
```

**Status Codes:**

- `200` - Company details retrieved successfully
- `401` - Unauthorized
- `404` - Company not found
- `500` - Internal server error

---

### 3. Get System Statistics

**GET** `/api/v1/admin/dashboard/statistics`

**Description:** Get comprehensive system statistics

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "System statistics retrieved successfully",
  "data": {
    "companies": {
      "total": 150,
      "active": 140,
      "trial": 30,
      "premium": 80,
      "basic": 30,
      "inactive": 10
    },
    "users": {
      "total": 500,
      "active": 450,
      "inactive": 50,
      "admin": 50,
      "regular": 450
    },
    "rfqs": {
      "total": 2500,
      "active": 150,
      "completed": 2200,
      "cancelled": 150,
      "thisMonth": 200
    },
    "quotes": {
      "total": 5000,
      "sent": 4500,
      "accepted": 900,
      "rejected": 3600,
      "thisMonth": 400
    },
    "revenue": {
      "total": 500000,
      "monthly": 45000,
      "currency": "USD",
      "growth": 25.8
    },
    "subscriptions": {
      "total": 300,
      "active": 250,
      "trial": 50,
      "churnRate": 5.2
    }
  }
}
```

**Status Codes:**

- `200` - Statistics retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 4. Get Recent Activity

**GET** `/api/v1/admin/dashboard/activity`

**Description:** Get recent system activity

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `limit` (optional): Number of activities to return (default: 50)
- `type` (optional): Filter by activity type

**Response:**

```json
{
  "success": true,
  "message": "Recent activity retrieved successfully",
  "data": {
    "activities": [
      {
        "id": "activity_123",
        "type": "company_created",
        "message": "New company 'Tech Corp' registered",
        "timestamp": "2024-01-01T10:30:00.000Z",
        "companyId": "company_123",
        "userId": "user_123",
        "metadata": {
          "companyName": "Tech Corp",
          "subscriptionPlan": "trial"
        }
      },
      {
        "id": "activity_124",
        "type": "subscription_upgraded",
        "message": "Company 'ABC Ltd' upgraded to premium plan",
        "timestamp": "2024-01-01T09:15:00.000Z",
        "companyId": "company_456",
        "userId": "user_456",
        "metadata": {
          "fromPlan": "trial",
          "toPlan": "premium",
          "amount": 2999
        }
      }
    ],
    "pagination": {
      "limit": 50,
      "total": 1000,
      "hasMore": true
    }
  }
}
```

**Status Codes:**

- `200` - Activity retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 5. Get Performance Metrics

**GET** `/api/v1/admin/dashboard/performance`

**Description:** Get system performance metrics

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Performance metrics retrieved successfully",
  "data": {
    "systemHealth": {
      "status": "healthy",
      "uptime": 99.9,
      "responseTime": 150,
      "errorRate": 0.1
    },
    "database": {
      "connectionPool": {
        "active": 5,
        "idle": 15,
        "total": 20
      },
      "queryPerformance": {
        "averageQueryTime": 25,
        "slowQueries": 2
      }
    },
    "api": {
      "totalRequests": 50000,
      "successfulRequests": 49500,
      "failedRequests": 500,
      "averageResponseTime": 200
    },
    "email": {
      "emailsSent": 10000,
      "deliveryRate": 98.5,
      "openRate": 25.2
    }
  }
}
```

**Status Codes:**

- `200` - Performance metrics retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 6. Get Revenue Overview

**GET** `/api/v1/admin/dashboard/revenue`

**Description:** Get revenue overview and trends

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
  "message": "Revenue overview retrieved successfully",
  "data": {
    "totalRevenue": 500000,
    "monthlyRevenue": 45000,
    "revenueGrowth": 25.8,
    "currency": "USD",
    "revenueByPlan": [
      {
        "plan": "premium",
        "revenue": 300000,
        "percentage": 60,
        "subscribers": 100
      },
      {
        "plan": "basic",
        "revenue": 200000,
        "percentage": 40,
        "subscribers": 200
      }
    ],
    "monthlyTrend": [
      {
        "month": "2024-01",
        "revenue": 35000
      },
      {
        "month": "2024-02",
        "revenue": 42000
      }
    ],
    "projectedRevenue": {
      "nextMonth": 50000,
      "nextQuarter": 150000
    }
  }
}
```

**Status Codes:**

- `200` - Revenue overview retrieved successfully
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

- Dashboard data is cached for 5 minutes for performance
- All metrics are calculated in real-time
- Historical data is available for up to 2 years
- Activity logs are retained for 90 days
- Performance metrics are updated every minute
