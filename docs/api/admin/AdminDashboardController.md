# Admin Dashboard Controller

## Overview

Unified controller that handles all admin dashboard data, comprehensive metrics, analytics, and reporting. This controller consolidates the dashboard, comprehensive dashboard, and analytics functionality into a single controller.

**Controller:** `AdminDashboardController`
**Route Files:** `adminDashboard.ts` (`/api/v1/admin/dashboard/*`) and `adminAnalytics.ts` (`/api/v1/admin/analytics/*`)

---

## Dashboard Routes (`/api/v1/admin/dashboard`)

All dashboard routes require admin authentication.

---

### 1. Get Dashboard Data

**GET** `/api/v1/admin/dashboard`

**Description:** Get main dashboard data with key metrics and overview

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
        { "month": "2024-01", "revenue": 35000 },
        { "month": "2024-02", "revenue": 42000 }
      ],
      "companyGrowth": [
        { "month": "2024-01", "newCompanies": 15 },
        { "month": "2024-02", "newCompanies": 20 }
      ]
    }
  }
}
```

**Status Codes:** `200` Success · `401` Unauthorized · `500` Internal Server Error

---

### 2. Get Comprehensive Dashboard

**GET** `/api/v1/admin/dashboard/comprehensive`

**Description:** Get comprehensive dashboard data with all system metrics, admin stats, system health, and alerts

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Comprehensive dashboard data retrieved successfully",
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
    "adminStats": {
      "totalAdmins": 10,
      "activeAdmins": 9,
      "superAdmins": 2,
      "regularAdmins": 7,
      "supportAdmins": 1
    },
    "systemHealth": {
      "uptime": 86400,
      "status": "healthy",
      "responseTime": 150,
      "errorRate": 0.1,
      "memoryUsage": 75.5,
      "cpuUsage": 45.2
    },
    "recentActivity": [],
    "metrics": {},
    "charts": {},
    "alerts": [
      {
        "type": "warning",
        "message": "High error rate detected",
        "timestamp": "2024-01-01T10:00:00.000Z"
      }
    ]
  }
}
```

**Status Codes:** `200` Success · `401` Unauthorized · `500` Internal Server Error

---

### 3. Get Company Details

**GET** `/api/v1/admin/dashboard/companies/:companyId/details`

**Description:** Get detailed information about a specific company

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**

| Parameter   | Type   | Description |
| ----------- | ------ | ----------- |
| `companyId` | string | Company ID  |

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
      "subscriptionPlan": "premium",
      "subscriptionStatus": "ACTIVE",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "users": [],
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
    "recentActivity": []
  }
}
```

**Status Codes:** `200` Success · `401` Unauthorized · `404` Company Not Found · `500` Internal Server Error

---

### 4. Get All RFQs

**GET** `/api/v1/admin/dashboard/rfqs`

**Description:** Get all RFQs across the platform

**Authorization:** Requires `admin` or `super_admin` role

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Status Codes:** `200` Success · `401` Unauthorized · `403` Forbidden · `500` Internal Server Error

---

### 5. Get All Quotes

**GET** `/api/v1/admin/dashboard/quotes`

**Description:** Get all quotes across the platform

**Authorization:** Requires `admin` or `super_admin` role

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Status Codes:** `200` Success · `401` Unauthorized · `403` Forbidden · `500` Internal Server Error

---

### 6. Get All Contacts

**GET** `/api/v1/admin/dashboard/contacts`

**Description:** Get all contacts across the platform

**Authorization:** Requires `admin` or `super_admin` role

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Status Codes:** `200` Success · `401` Unauthorized · `403` Forbidden · `500` Internal Server Error

---

### 7. Get All Shipping Lines

**GET** `/api/v1/admin/dashboard/shipping-lines`

**Description:** Get all shipping lines across the platform

**Authorization:** Requires `admin` or `super_admin` role

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Status Codes:** `200` Success · `401` Unauthorized · `403` Forbidden · `500` Internal Server Error

---

### 8. Get All Email Logs

**GET** `/api/v1/admin/dashboard/emails`

**Description:** Get all email logs across the platform

**Authorization:** Requires `admin` or `super_admin` role

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Status Codes:** `200` Success · `401` Unauthorized · `403` Forbidden · `500` Internal Server Error

---

### 9. Get Admin Management Overview

**GET** `/api/v1/admin/dashboard/admin-management`

**Description:** Get admin management overview and statistics

**Authorization:** Requires `admin` or `super_admin` role

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Status Codes:** `200` Success · `401` Unauthorized · `403` Forbidden · `500` Internal Server Error

---

### 10. Get Company Management Overview

**GET** `/api/v1/admin/dashboard/company-management`

**Description:** Get company management overview and statistics

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Status Codes:** `200` Success · `401` Unauthorized · `500` Internal Server Error

---

### 11. Get Ticket Management Overview

**GET** `/api/v1/admin/dashboard/ticket-management`

**Description:** Get support ticket management overview

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Status Codes:** `200` Success · `401` Unauthorized · `500` Internal Server Error

---

### 12. Get System Features Overview

**GET** `/api/v1/admin/dashboard/system-features`

**Description:** Get system features overview and status

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Status Codes:** `200` Success · `401` Unauthorized · `500` Internal Server Error

---

### 13. Get Subscription Overview

**GET** `/api/v1/admin/dashboard/subscriptions`

**Description:** Get subscription overview and metrics

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Subscription overview retrieved successfully",
  "data": {
    "totalSubscriptions": 300,
    "activeSubscriptions": 250,
    "trialSubscriptions": 50,
    "trialConversionRate": 83.3,
    "churnRate": 5.2,
    "monthlyRecurringRevenue": 65000
  }
}
```

**Status Codes:** `200` Success · `401` Unauthorized · `500` Internal Server Error

---

### 14. Get Dashboard Analytics Overview

**GET** `/api/v1/admin/dashboard/analytics`

**Description:** Get analytics overview from the dashboard

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Status Codes:** `200` Success · `401` Unauthorized · `500` Internal Server Error

---

### 15. Get Dashboard Subscription Analytics

**GET** `/api/v1/admin/dashboard/analytics/subscriptions`

**Description:** Get subscription analytics from the dashboard

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Status Codes:** `200` Success · `401` Unauthorized · `500` Internal Server Error

---

### 16. Get Dashboard Email Analytics

**GET** `/api/v1/admin/dashboard/analytics/emails`

**Description:** Get email analytics from the dashboard

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Status Codes:** `200` Success · `401` Unauthorized · `500` Internal Server Error

---

### 17. Get Dashboard RFQ Analytics

**GET** `/api/v1/admin/dashboard/analytics/rfqs`

**Description:** Get RFQ analytics from the dashboard

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Status Codes:** `200` Success · `401` Unauthorized · `500` Internal Server Error

---

### 18. Get Dashboard Quote Analytics

**GET** `/api/v1/admin/dashboard/analytics/quotes`

**Description:** Get quote analytics from the dashboard

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Status Codes:** `200` Success · `401` Unauthorized · `500` Internal Server Error

---

### 19. Get Recent Activity

**GET** `/api/v1/admin/dashboard/recent-activity`

**Description:** Get recent system activity

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

| Parameter | Type   | Default | Description                    |
| --------- | ------ | ------- | ------------------------------ |
| `limit`   | number | 50      | Number of activities to return |
| `type`    | string | —       | Filter by activity type        |

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
        "metadata": {
          "companyName": "Tech Corp",
          "subscriptionPlan": "trial"
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

**Status Codes:** `200` Success · `401` Unauthorized · `500` Internal Server Error

---

### 20. Get System Health

**GET** `/api/v1/admin/dashboard/system-health`

**Description:** Get system health and performance metrics

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "System health retrieved successfully",
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

**Status Codes:** `200` Success · `401` Unauthorized · `500` Internal Server Error

---

## Analytics Routes (`/api/v1/admin/analytics`)

All analytics routes require admin authentication. These provide detailed analytics with time-range filtering.

---

### 21. Get Company Growth

**GET** `/api/v1/admin/analytics/company-growth`

**Description:** Get company growth analytics over time

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

| Parameter | Type   | Default | Description                 |
| --------- | ------ | ------- | --------------------------- |
| `months`  | number | 12      | Number of months to analyze |

**Response:**

```json
{
  "success": true,
  "message": "Company growth data retrieved successfully",
  "data": {
    "totalCompanies": 150,
    "newCompaniesThisMonth": 25,
    "growthRate": 20.5,
    "monthlyGrowth": [
      {
        "month": "2024-01",
        "newCompanies": 15,
        "totalCompanies": 120,
        "growthRate": 14.3
      }
    ],
    "averageMonthlyGrowth": 18.2,
    "projectedGrowth": {
      "nextMonth": 30,
      "nextQuarter": 90
    }
  }
}
```

**Status Codes:** `200` Success · `401` Unauthorized · `500` Internal Server Error

---

### 22. Get Revenue

**GET** `/api/v1/admin/analytics/revenue`

**Description:** Get revenue analytics and trends

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

| Parameter | Type   | Default | Description                 |
| --------- | ------ | ------- | --------------------------- |
| `months`  | number | 12      | Number of months to analyze |

**Response:**

```json
{
  "success": true,
  "message": "Revenue data retrieved successfully",
  "data": {
    "totalRevenue": 500000,
    "monthlyRevenue": 45000,
    "revenueGrowth": 25.8,
    "currency": "USD",
    "revenueByPlan": [
      {
        "plan": "premium",
        "revenue": 300000,
        "subscribers": 100,
        "percentage": 60
      }
    ],
    "projectedRevenue": {
      "nextMonth": 50000,
      "nextQuarter": 150000
    }
  }
}
```

**Status Codes:** `200` Success · `401` Unauthorized · `500` Internal Server Error

---

### 23. Get User Activity

**GET** `/api/v1/admin/analytics/user-activity`

**Description:** Get user activity and engagement metrics

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

| Parameter | Type   | Default | Description               |
| --------- | ------ | ------- | ------------------------- |
| `days`    | number | 30      | Number of days to analyze |

**Response:**

```json
{
  "success": true,
  "message": "User activity data retrieved successfully",
  "data": {
    "totalActiveUsers": 500,
    "dailyActiveUsers": 350,
    "weeklyActiveUsers": 450,
    "monthlyActiveUsers": 500,
    "userEngagement": {
      "averageSessionDuration": 1800,
      "averageSessionsPerUser": 5.2,
      "bounceRate": 15.5,
      "retentionRate": 85.2
    },
    "topFeatures": [
      {
        "feature": "RFQ Management",
        "usage": 85.5,
        "users": 425
      }
    ]
  }
}
```

**Status Codes:** `200` Success · `401` Unauthorized · `500` Internal Server Error

---

### 24. Get Email Performance

**GET** `/api/v1/admin/analytics/email-performance`

**Description:** Get email campaign and delivery analytics

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

| Parameter | Type   | Default | Description                 |
| --------- | ------ | ------- | --------------------------- |
| `months`  | number | 12      | Number of months to analyze |

**Response:**

```json
{
  "success": true,
  "message": "Email analytics retrieved successfully",
  "data": {
    "totalEmails": 100000,
    "deliveredEmails": 98500,
    "bouncedEmails": 1500,
    "deliveryRate": 98.5,
    "openRate": 25.2,
    "clickRate": 8.5,
    "unsubscribeRate": 2.1,
    "emailByType": [
      {
        "type": "RFQ_NOTIFICATION",
        "sent": 50000,
        "openRate": 30.5,
        "clickRate": 12.2
      }
    ]
  }
}
```

**Status Codes:** `200` Success · `401` Unauthorized · `500` Internal Server Error

---

### 25. Get RFQ Performance

**GET** `/api/v1/admin/analytics/rfq-performance`

**Description:** Get RFQ creation and processing analytics

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

| Parameter | Type   | Default | Description                 |
| --------- | ------ | ------- | --------------------------- |
| `months`  | number | 12      | Number of months to analyze |

**Response:**

```json
{
  "success": true,
  "message": "RFQ analytics retrieved successfully",
  "data": {
    "totalRFQs": 2500,
    "activeRFQs": 150,
    "completedRFQs": 2200,
    "cancelledRFQs": 150,
    "averageProcessingTime": 72,
    "rfqTrends": [
      {
        "month": "2024-01",
        "created": 200,
        "completed": 180,
        "cancelled": 15
      }
    ],
    "topCompanies": [
      {
        "companyId": "company_1",
        "companyName": "Tech Corp",
        "rfqCount": 150,
        "completionRate": 95.5
      }
    ]
  }
}
```

**Status Codes:** `200` Success · `401` Unauthorized · `500` Internal Server Error

---

### 26. Get Quote Performance

**GET** `/api/v1/admin/analytics/quote-performance`

**Description:** Get quote generation and acceptance analytics

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

| Parameter | Type   | Default | Description                 |
| --------- | ------ | ------- | --------------------------- |
| `months`  | number | 12      | Number of months to analyze |

**Response:**

```json
{
  "success": true,
  "message": "Quote analytics retrieved successfully",
  "data": {
    "totalQuotes": 5000,
    "sentQuotes": 4500,
    "acceptedQuotes": 900,
    "rejectedQuotes": 3600,
    "acceptanceRate": 20,
    "averageQuoteValue": 2500,
    "quoteTrends": [
      {
        "month": "2024-01",
        "generated": 400,
        "sent": 350,
        "accepted": 70
      }
    ],
    "averageResponseTime": 24
  }
}
```

**Status Codes:** `200` Success · `401` Unauthorized · `500` Internal Server Error

---

### 27. Get Top Companies

**GET** `/api/v1/admin/analytics/top-companies`

**Description:** Get top-performing companies analytics

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Top companies retrieved successfully",
  "data": {
    "topCompanies": [
      {
        "companyId": "company_1",
        "companyName": "Tech Corp",
        "rfqCount": 150,
        "quoteCount": 300,
        "revenue": 50000,
        "completionRate": 95.5
      }
    ]
  }
}
```

**Status Codes:** `200` Success · `401` Unauthorized · `500` Internal Server Error

---

### 28. Get System Health (Analytics)

**GET** `/api/v1/admin/analytics/system-health`

**Description:** Get system health metrics from the analytics perspective

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "System health retrieved successfully",
  "data": {
    "systemHealth": {
      "status": "healthy",
      "uptime": 99.9,
      "responseTime": 150,
      "errorRate": 0.1
    },
    "databaseMetrics": {
      "connectionPool": { "active": 5, "idle": 15, "total": 20 },
      "queryPerformance": { "averageQueryTime": 25, "slowQueries": 2 }
    },
    "apiMetrics": {
      "totalRequests": 50000,
      "successfulRequests": 49500,
      "failedRequests": 500,
      "averageResponseTime": 200
    },
    "emailMetrics": {
      "emailsSent": 10000,
      "deliveryRate": 98.5,
      "openRate": 25.2,
      "clickRate": 8.5
    }
  }
}
```

**Status Codes:** `200` Success · `401` Unauthorized · `500` Internal Server Error

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
- Time-based analytics queries support various periods (days, months, quarters)
- Routes marked with `requireAdminOrSuperAdmin` require `admin` or `super_admin` role
