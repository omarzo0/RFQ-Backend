# Admin Analytics Controller

## Overview

Handles system-wide analytics and reporting for admin users including company growth, revenue, user activity, and performance metrics.

## Endpoints

### 1. Get Company Growth Data

**GET** `/api/v1/admin/analytics/company-growth`

**Description:** Get company growth analytics over time

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `months` (optional): Number of months to analyze (default: 12)

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
      },
      {
        "month": "2024-02",
        "newCompanies": 20,
        "totalCompanies": 140,
        "growthRate": 16.7
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

**Status Codes:**

- `200` - Data retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 2. Get Revenue Data

**GET** `/api/v1/admin/analytics/revenue`

**Description:** Get revenue analytics and trends

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `months` (optional): Number of months to analyze (default: 12)

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
    "monthlyRevenue": [
      {
        "month": "2024-01",
        "revenue": 35000,
        "subscriptions": 120,
        "averageRevenuePerUser": 291.67
      },
      {
        "month": "2024-02",
        "revenue": 42000,
        "subscriptions": 140,
        "averageRevenuePerUser": 300.0
      }
    ],
    "revenueByPlan": [
      {
        "plan": "premium",
        "revenue": 300000,
        "subscribers": 100,
        "percentage": 60
      },
      {
        "plan": "basic",
        "revenue": 200000,
        "subscribers": 200,
        "percentage": 40
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

- `200` - Data retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 3. Get User Activity Data

**GET** `/api/v1/admin/analytics/user-activity`

**Description:** Get user activity and engagement metrics

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `days` (optional): Number of days to analyze (default: 30)

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
    "activityByDay": [
      {
        "date": "2024-01-01",
        "activeUsers": 320,
        "newUsers": 15,
        "sessions": 450
      },
      {
        "date": "2024-01-02",
        "activeUsers": 340,
        "newUsers": 18,
        "sessions": 480
      }
    ],
    "topFeatures": [
      {
        "feature": "RFQ Management",
        "usage": 85.5,
        "users": 425
      },
      {
        "feature": "Quote Generation",
        "usage": 78.2,
        "users": 390
      }
    ]
  }
}
```

**Status Codes:**

- `200` - Data retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 4. Get System Performance Metrics

**GET** `/api/v1/admin/analytics/performance`

**Description:** Get system performance and health metrics

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
    "databaseMetrics": {
      "connectionPool": {
        "active": 5,
        "idle": 15,
        "total": 20
      },
      "queryPerformance": {
        "averageQueryTime": 25,
        "slowQueries": 2,
        "totalQueries": 10000
      }
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
    },
    "storageMetrics": {
      "totalStorage": "500GB",
      "usedStorage": "300GB",
      "availableStorage": "200GB"
    }
  }
}
```

**Status Codes:**

- `200` - Data retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 5. Get RFQ Analytics

**GET** `/api/v1/admin/analytics/rfqs`

**Description:** Get RFQ creation and processing analytics

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `months` (optional): Number of months to analyze (default: 12)

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
      },
      {
        "month": "2024-02",
        "created": 250,
        "completed": 220,
        "cancelled": 20
      }
    ],
    "rfqByIndustry": [
      {
        "industry": "Technology",
        "count": 800,
        "percentage": 32
      },
      {
        "industry": "Manufacturing",
        "count": 600,
        "percentage": 24
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

**Status Codes:**

- `200` - Data retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 6. Get Quote Analytics

**GET** `/api/v1/admin/analytics/quotes`

**Description:** Get quote generation and acceptance analytics

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `months` (optional): Number of months to analyze (default: 12)

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
      },
      {
        "month": "2024-02",
        "generated": 450,
        "sent": 400,
        "accepted": 80
      }
    ],
    "quoteByStatus": [
      {
        "status": "sent",
        "count": 4500,
        "percentage": 90
      },
      {
        "status": "accepted",
        "count": 900,
        "percentage": 18
      }
    ],
    "averageResponseTime": 24
  }
}
```

**Status Codes:**

- `200` - Data retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 7. Get Email Analytics

**GET** `/api/v1/admin/analytics/emails`

**Description:** Get email campaign and delivery analytics

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `months` (optional): Number of months to analyze (default: 12)

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
    "emailTrends": [
      {
        "month": "2024-01",
        "sent": 8000,
        "delivered": 7880,
        "opened": 1985,
        "clicked": 670
      }
    ],
    "emailByType": [
      {
        "type": "RFQ_NOTIFICATION",
        "sent": 50000,
        "openRate": 30.5,
        "clickRate": 12.2
      },
      {
        "type": "QUOTE_RESPONSE",
        "sent": 30000,
        "openRate": 20.1,
        "clickRate": 5.8
      }
    ],
    "topPerformingTemplates": [
      {
        "templateId": "template_1",
        "name": "RFQ Welcome",
        "sent": 10000,
        "openRate": 35.2,
        "clickRate": 15.8
      }
    ]
  }
}
```

**Status Codes:**

- `200` - Data retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 8. Get Subscription Analytics

**GET** `/api/v1/admin/analytics/subscriptions`

**Description:** Get subscription and trial analytics

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Subscription analytics retrieved successfully",
  "data": {
    "totalSubscriptions": 300,
    "activeSubscriptions": 250,
    "trialSubscriptions": 50,
    "trialConversionRate": 83.3,
    "averageTrialDuration": 25,
    "subscriptionByPlan": [
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
      }
    ],
    "trialStatus": [
      {
        "status": "active",
        "count": 30,
        "averageDaysLeft": 15
      },
      {
        "status": "expired",
        "count": 20,
        "averageDaysExpired": 5
      }
    ],
    "churnRate": 5.2,
    "monthlyRecurringRevenue": 65000
  }
}
```

**Status Codes:**

- `200` - Data retrieved successfully
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

- All analytics data is calculated in real-time
- Time-based queries support various periods (days, months, quarters)
- Data is cached for performance optimization
- All metrics are updated every hour
- Historical data is available for up to 2 years
