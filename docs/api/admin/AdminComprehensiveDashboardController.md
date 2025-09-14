# Admin Comprehensive Dashboard Controller

## Overview

Handles comprehensive admin dashboard data including system-wide metrics, analytics, and real-time monitoring.

## Endpoints

### 1. Get Comprehensive Dashboard

**GET** `/api/v1/admin/dashboard/comprehensive`

**Description:** Get comprehensive dashboard data with all system metrics

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
    },
    "alerts": [
      {
        "type": "warning",
        "message": "High error rate detected",
        "timestamp": "2024-01-01T10:00:00.000Z"
      },
      {
        "type": "info",
        "message": "System maintenance scheduled",
        "timestamp": "2024-01-01T09:00:00.000Z"
      }
    ]
  }
}
```

**Status Codes:**

- `200` - Dashboard data retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 2. Get Real-time Metrics

**GET** `/api/v1/admin/dashboard/real-time`

**Description:** Get real-time system metrics

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Real-time metrics retrieved successfully",
  "data": {
    "systemHealth": {
      "uptime": 86400,
      "status": "healthy",
      "responseTime": 150,
      "errorRate": 0.1,
      "memoryUsage": 75.5,
      "cpuUsage": 45.2
    },
    "activeConnections": {
      "total": 150,
      "admin": 5,
      "company": 145
    },
    "apiMetrics": {
      "requestsPerMinute": 120,
      "averageResponseTime": 200,
      "errorRate": 0.5
    },
    "databaseMetrics": {
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
    "emailMetrics": {
      "emailsInQueue": 10,
      "emailsSentToday": 1000,
      "deliveryRate": 98.5
    }
  }
}
```

**Status Codes:**

- `200` - Real-time metrics retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 3. Get System Alerts

**GET** `/api/v1/admin/dashboard/alerts`

**Description:** Get system alerts and notifications

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `severity` (optional): Filter by alert severity (info, warning, error, critical)
- `limit` (optional): Number of alerts to return (default: 50)

**Response:**

```json
{
  "success": true,
  "message": "System alerts retrieved successfully",
  "data": {
    "alerts": [
      {
        "id": "alert_123",
        "type": "warning",
        "severity": "medium",
        "message": "High error rate detected",
        "description": "API error rate has exceeded 5% in the last hour",
        "timestamp": "2024-01-01T10:00:00.000Z",
        "isResolved": false,
        "resolvedAt": null
      },
      {
        "id": "alert_124",
        "type": "info",
        "severity": "low",
        "message": "System maintenance scheduled",
        "description": "Scheduled maintenance window: 2024-01-02 02:00-04:00 UTC",
        "timestamp": "2024-01-01T09:00:00.000Z",
        "isResolved": false,
        "resolvedAt": null
      }
    ],
    "summary": {
      "total": 10,
      "critical": 1,
      "error": 2,
      "warning": 3,
      "info": 4
    }
  }
}
```

**Status Codes:**

- `200` - Alerts retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 4. Get Performance Metrics

**GET** `/api/v1/admin/dashboard/performance`

**Description:** Get detailed performance metrics

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `period` (optional): Time period (1h, 24h, 7d, 30d)

**Response:**

```json
{
  "success": true,
  "message": "Performance metrics retrieved successfully",
  "data": {
    "apiPerformance": {
      "totalRequests": 50000,
      "successfulRequests": 49500,
      "failedRequests": 500,
      "averageResponseTime": 200,
      "p95ResponseTime": 500,
      "p99ResponseTime": 1000
    },
    "databasePerformance": {
      "totalQueries": 100000,
      "averageQueryTime": 25,
      "slowQueries": 50,
      "connectionPoolUtilization": 75
    },
    "emailPerformance": {
      "emailsSent": 10000,
      "deliveryRate": 98.5,
      "openRate": 25.2,
      "clickRate": 8.5
    },
    "systemResources": {
      "memoryUsage": 75.5,
      "cpuUsage": 45.2,
      "diskUsage": 60.8,
      "networkUsage": 30.2
    },
    "trends": [
      {
        "timestamp": "2024-01-01T10:00:00.000Z",
        "responseTime": 200,
        "errorRate": 0.5,
        "memoryUsage": 75.5,
        "cpuUsage": 45.2
      },
      {
        "timestamp": "2024-01-01T11:00:00.000Z",
        "responseTime": 180,
        "errorRate": 0.3,
        "memoryUsage": 76.2,
        "cpuUsage": 47.1
      }
    ]
  }
}
```

**Status Codes:**

- `200` - Performance metrics retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 5. Get User Activity

**GET** `/api/v1/admin/dashboard/user-activity`

**Description:** Get user activity metrics and trends

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `period` (optional): Time period (1h, 24h, 7d, 30d)

**Response:**

```json
{
  "success": true,
  "message": "User activity retrieved successfully",
  "data": {
    "overview": {
      "totalActiveUsers": 500,
      "dailyActiveUsers": 350,
      "weeklyActiveUsers": 450,
      "monthlyActiveUsers": 500,
      "newUsers": 25,
      "returningUsers": 325
    },
    "engagement": {
      "averageSessionDuration": 1800,
      "averageSessionsPerUser": 5.2,
      "bounceRate": 15.5,
      "retentionRate": 85.2
    },
    "activityByHour": [
      {
        "hour": "00:00",
        "activeUsers": 50,
        "sessions": 75
      },
      {
        "hour": "01:00",
        "activeUsers": 30,
        "sessions": 45
      }
    ],
    "topFeatures": [
      {
        "feature": "RFQ Management",
        "usage": 85.5,
        "users": 425,
        "sessions": 1200
      },
      {
        "feature": "Quote Generation",
        "usage": 78.2,
        "users": 390,
        "sessions": 900
      }
    ],
    "geographicDistribution": [
      {
        "country": "United States",
        "users": 200,
        "percentage": 40
      },
      {
        "country": "United Kingdom",
        "users": 150,
        "percentage": 30
      }
    ]
  }
}
```

**Status Codes:**

- `200` - User activity retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 6. Get Financial Overview

**GET** `/api/v1/admin/dashboard/financial`

**Description:** Get comprehensive financial overview

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
  "message": "Financial overview retrieved successfully",
  "data": {
    "revenue": {
      "total": 1000000,
      "monthly": 50000,
      "growth": 25.8,
      "currency": "USD"
    },
    "subscriptions": {
      "total": 300,
      "active": 250,
      "trial": 50,
      "churnRate": 5.2
    },
    "transactions": {
      "total": 10000,
      "successful": 9500,
      "failed": 500,
      "successRate": 95
    },
    "revenueByPlan": [
      {
        "plan": "premium",
        "revenue": 600000,
        "subscribers": 200,
        "percentage": 60
      },
      {
        "plan": "basic",
        "revenue": 400000,
        "subscribers": 400,
        "percentage": 40
      }
    ],
    "monthlyTrend": [
      {
        "month": "2024-01",
        "revenue": 35000,
        "subscriptions": 120
      },
      {
        "month": "2024-02",
        "revenue": 42000,
        "subscriptions": 140
      }
    ],
    "projections": {
      "nextMonth": 55000,
      "nextQuarter": 165000,
      "nextYear": 660000
    }
  }
}
```

**Status Codes:**

- `200` - Financial overview retrieved successfully
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

- All metrics are calculated in real-time
- Dashboard data is cached for 5 minutes for performance
- Historical data is available for up to 2 years
- Alerts are generated automatically based on thresholds
- Performance metrics are updated every minute
- User activity data is anonymized for privacy
