# Company Analytics Controller

## Overview

Handles analytics and reporting for company users including performance metrics, RFQ analytics, quote analytics, and email analytics.

## Endpoints

### 1. Get Performance Metrics

**GET** `/api/v1/company/analytics/performance-metrics`

**Description:** Get company performance metrics

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Query Parameters:**

- `startDate` (optional): Start date (ISO format)
- `endDate` (optional): End date (ISO format)

**Response:**

```json
{
  "success": true,
  "message": "Performance metrics retrieved successfully",
  "data": {
    "overview": {
      "totalRFQs": 100,
      "totalQuotes": 200,
      "totalEmails": 500,
      "totalContacts": 50,
      "conversionRate": 25.5,
      "responseTime": 4.2
    },
    "rfqMetrics": {
      "created": 100,
      "completed": 80,
      "cancelled": 10,
      "averageProcessingTime": 72,
      "completionRate": 80
    },
    "quoteMetrics": {
      "generated": 200,
      "sent": 180,
      "accepted": 45,
      "rejected": 135,
      "acceptanceRate": 25,
      "averageQuoteValue": 5000
    },
    "emailMetrics": {
      "sent": 500,
      "delivered": 480,
      "opened": 300,
      "clicked": 150,
      "deliveryRate": 96,
      "openRate": 62.5,
      "clickRate": 50
    },
    "contactMetrics": {
      "total": 50,
      "active": 45,
      "newThisMonth": 10,
      "engagementRate": 75
    }
  }
}
```

**Status Codes:**

- `200` - Metrics retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 2. Get RFQ Analytics

**GET** `/api/v1/company/analytics/rfq-analytics`

**Description:** Get RFQ analytics and trends

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Query Parameters:**

- `startDate` (optional): Start date (ISO format)
- `endDate` (optional): End date (ISO format)

**Response:**

```json
{
  "success": true,
  "message": "RFQ analytics retrieved successfully",
  "data": {
    "overview": {
      "totalRFQs": 100,
      "activeRFQs": 20,
      "completedRFQs": 70,
      "cancelledRFQs": 10,
      "averageProcessingTime": 72,
      "completionRate": 70
    },
    "byStatus": [
      {
        "status": "active",
        "count": 20,
        "percentage": 20
      },
      {
        "status": "completed",
        "count": 70,
        "percentage": 70
      },
      {
        "status": "cancelled",
        "count": 10,
        "percentage": 10
      }
    ],
    "byPriority": [
      {
        "priority": "high",
        "count": 30,
        "percentage": 30
      },
      {
        "priority": "medium",
        "count": 50,
        "percentage": 50
      },
      {
        "priority": "low",
        "count": 20,
        "percentage": 20
      }
    ],
    "byTradeLane": [
      {
        "tradeLane": "Asia-North America",
        "count": 40,
        "percentage": 40
      },
      {
        "tradeLane": "Europe-Asia",
        "count": 30,
        "percentage": 30
      },
      {
        "tradeLane": "Asia-Europe",
        "count": 30,
        "percentage": 30
      }
    ],
    "trends": [
      {
        "date": "2024-01-01",
        "created": 5,
        "completed": 4,
        "cancelled": 1
      },
      {
        "date": "2024-01-02",
        "created": 6,
        "completed": 5,
        "cancelled": 0
      }
    ],
    "topContacts": [
      {
        "contactId": "contact_123",
        "contactName": "John Doe",
        "rfqCount": 15,
        "completionRate": 80
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

### 3. Get Quote Analytics

**GET** `/api/v1/company/analytics/quote-analytics`

**Description:** Get quote analytics and trends

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Query Parameters:**

- `startDate` (optional): Start date (ISO format)
- `endDate` (optional): End date (ISO format)

**Response:**

```json
{
  "success": true,
  "message": "Quote analytics retrieved successfully",
  "data": {
    "overview": {
      "totalQuotes": 200,
      "sentQuotes": 180,
      "acceptedQuotes": 45,
      "rejectedQuotes": 135,
      "acceptanceRate": 25,
      "averageQuoteValue": 5000,
      "totalQuoteValue": 1000000
    },
    "byStatus": [
      {
        "status": "sent",
        "count": 180,
        "percentage": 90
      },
      {
        "status": "accepted",
        "count": 45,
        "percentage": 25
      },
      {
        "status": "rejected",
        "count": 135,
        "percentage": 75
      }
    ],
    "byMarketPosition": [
      {
        "position": "competitive",
        "count": 100,
        "percentage": 50,
        "acceptanceRate": 30
      },
      {
        "position": "premium",
        "count": 80,
        "percentage": 40,
        "acceptanceRate": 20
      }
    ],
    "byCurrency": [
      {
        "currency": "USD",
        "count": 150,
        "percentage": 75,
        "totalValue": 750000
      },
      {
        "currency": "EUR",
        "count": 50,
        "percentage": 25,
        "totalValue": 250000
      }
    ],
    "trends": [
      {
        "date": "2024-01-01",
        "generated": 10,
        "sent": 9,
        "accepted": 2
      },
      {
        "date": "2024-01-02",
        "generated": 12,
        "sent": 11,
        "accepted": 3
      }
    ],
    "topContacts": [
      {
        "contactId": "contact_123",
        "contactName": "John Doe",
        "quoteCount": 25,
        "acceptanceRate": 40
      }
    ],
    "topShippingLines": [
      {
        "shippingLineId": "shipping_123",
        "shippingLineName": "Ocean Express",
        "quoteCount": 30,
        "acceptanceRate": 35
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

### 4. Get Email Analytics

**GET** `/api/v1/company/analytics/email-analytics`

**Description:** Get email analytics and trends

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Query Parameters:**

- `startDate` (optional): Start date (ISO format)
- `endDate` (optional): End date (ISO format)

**Response:**

```json
{
  "success": true,
  "message": "Email analytics retrieved successfully",
  "data": {
    "overview": {
      "totalEmails": 500,
      "sentEmails": 480,
      "deliveredEmails": 460,
      "openedEmails": 300,
      "clickedEmails": 150,
      "deliveryRate": 95.8,
      "openRate": 65.2,
      "clickRate": 50
    },
    "byType": [
      {
        "emailType": "QUOTE_RESPONSE",
        "sent": 200,
        "opened": 140,
        "clicked": 70,
        "openRate": 70,
        "clickRate": 50
      },
      {
        "emailType": "FOLLOW_UP",
        "sent": 150,
        "opened": 90,
        "clicked": 45,
        "openRate": 60,
        "clickRate": 50
      }
    ],
    "byStatus": [
      {
        "status": "sent",
        "count": 480,
        "percentage": 96
      },
      {
        "status": "delivered",
        "count": 460,
        "percentage": 95.8
      },
      {
        "status": "opened",
        "count": 300,
        "percentage": 65.2
      }
    ],
    "trends": [
      {
        "date": "2024-01-01",
        "sent": 25,
        "opened": 18,
        "clicked": 9
      },
      {
        "date": "2024-01-02",
        "sent": 30,
        "opened": 20,
        "clicked": 10
      }
    ],
    "topTemplates": [
      {
        "templateId": "template_123",
        "templateName": "Quote Response Template",
        "sent": 100,
        "openRate": 75,
        "clickRate": 45
      }
    ],
    "topContacts": [
      {
        "contactId": "contact_123",
        "contactName": "John Doe",
        "emailsSent": 50,
        "openRate": 80,
        "clickRate": 60
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

### 5. Get Contact Analytics

**GET** `/api/v1/company/analytics/contact-analytics`

**Description:** Get contact analytics and trends

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Query Parameters:**

- `startDate` (optional): Start date (ISO format)
- `endDate` (optional): End date (ISO format)

**Response:**

```json
{
  "success": true,
  "message": "Contact analytics retrieved successfully",
  "data": {
    "overview": {
      "totalContacts": 50,
      "activeContacts": 45,
      "inactiveContacts": 5,
      "newContactsThisMonth": 10,
      "engagementRate": 75
    },
    "byStatus": [
      {
        "status": "active",
        "count": 45,
        "percentage": 90
      },
      {
        "status": "inactive",
        "count": 5,
        "percentage": 10
      }
    ],
    "byDepartment": [
      {
        "department": "Sales",
        "count": 20,
        "percentage": 40
      },
      {
        "department": "Operations",
        "count": 15,
        "percentage": 30
      },
      {
        "department": "Management",
        "count": 10,
        "percentage": 20
      }
    ],
    "bySeniority": [
      {
        "seniority": "senior",
        "count": 20,
        "percentage": 40
      },
      {
        "seniority": "mid",
        "count": 20,
        "percentage": 40
      },
      {
        "seniority": "junior",
        "count": 10,
        "percentage": 20
      }
    ],
    "bySpecialization": [
      {
        "specialization": "Ocean Freight",
        "count": 25,
        "percentage": 50
      },
      {
        "specialization": "Air Freight",
        "count": 15,
        "percentage": 30
      },
      {
        "specialization": "Logistics",
        "count": 10,
        "percentage": 20
      }
    ],
    "topCompanies": [
      {
        "company": "ABC Shipping Co",
        "contactCount": 8,
        "percentage": 16
      },
      {
        "company": "XYZ Logistics",
        "contactCount": 6,
        "percentage": 12
      }
    ],
    "contactGrowth": [
      {
        "date": "2024-01-01",
        "newContacts": 2,
        "totalContacts": 48
      },
      {
        "date": "2024-01-02",
        "newContacts": 3,
        "totalContacts": 51
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

### 6. Get Revenue Analytics

**GET** `/api/v1/company/analytics/revenue-analytics`

**Description:** Get revenue analytics and trends

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Query Parameters:**

- `startDate` (optional): Start date (ISO format)
- `endDate` (optional): End date (ISO format)

**Response:**

```json
{
  "success": true,
  "message": "Revenue analytics retrieved successfully",
  "data": {
    "overview": {
      "totalRevenue": 1000000,
      "monthlyRevenue": 50000,
      "revenueGrowth": 25.8,
      "currency": "USD",
      "averageDealSize": 10000
    },
    "bySource": [
      {
        "source": "quotes",
        "revenue": 800000,
        "percentage": 80,
        "dealCount": 80
      },
      {
        "source": "direct",
        "revenue": 200000,
        "percentage": 20,
        "dealCount": 20
      }
    ],
    "byCurrency": [
      {
        "currency": "USD",
        "revenue": 750000,
        "percentage": 75
      },
      {
        "currency": "EUR",
        "revenue": 250000,
        "percentage": 25
      }
    ],
    "trends": [
      {
        "date": "2024-01-01",
        "revenue": 5000,
        "dealCount": 1
      },
      {
        "date": "2024-01-02",
        "revenue": 8000,
        "dealCount": 2
      }
    ],
    "topContacts": [
      {
        "contactId": "contact_123",
        "contactName": "John Doe",
        "revenue": 100000,
        "dealCount": 10
      }
    ],
    "topShippingLines": [
      {
        "shippingLineId": "shipping_123",
        "shippingLineName": "Ocean Express",
        "revenue": 200000,
        "dealCount": 20
      }
    ],
    "monthlyBreakdown": [
      {
        "month": "2024-01",
        "revenue": 45000,
        "dealCount": 5
      },
      {
        "month": "2024-02",
        "revenue": 55000,
        "dealCount": 6
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

### 7. Get Dashboard Summary

**GET** `/api/v1/company/analytics/dashboard-summary`

**Description:** Get comprehensive dashboard summary

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Dashboard summary retrieved successfully",
  "data": {
    "overview": {
      "totalRFQs": 100,
      "totalQuotes": 200,
      "totalEmails": 500,
      "totalContacts": 50,
      "totalRevenue": 1000000,
      "conversionRate": 25.5
    },
    "recentActivity": [
      {
        "type": "rfq_created",
        "message": "New RFQ created: Ocean Freight from Shanghai to Los Angeles",
        "timestamp": "2024-01-01T10:30:00.000Z",
        "rfqId": "rfq_123"
      },
      {
        "type": "quote_sent",
        "message": "Quote sent to John Doe at ABC Shipping Co",
        "timestamp": "2024-01-01T09:15:00.000Z",
        "quoteId": "quote_456"
      }
    ],
    "metrics": {
      "rfqCompletionRate": 80,
      "quoteAcceptanceRate": 25,
      "emailOpenRate": 65.2,
      "contactEngagementRate": 75
    },
    "alerts": [
      {
        "type": "warning",
        "message": "Low quote acceptance rate this month",
        "timestamp": "2024-01-01T08:00:00.000Z"
      },
      {
        "type": "info",
        "message": "New contact added: Jane Smith",
        "timestamp": "2024-01-01T07:30:00.000Z"
      }
    ]
  }
}
```

**Status Codes:**

- `200` - Dashboard summary retrieved successfully
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

All endpoints require a valid company JWT token in the Authorization header:

```
Authorization: Bearer <company_jwt_token>
```

## Notes

- All analytics data is calculated in real-time
- Date ranges are optional and default to the last 30 days
- All metrics are company-specific and isolated
- Analytics are updated every hour
- Historical data is available for up to 2 years
- All timestamps are in ISO 8601 format
