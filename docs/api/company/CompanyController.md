# Company Profile Controller

## Overview

Handles company profile management for company users including profile updates, settings, and company information management.

## Endpoints

### 1. Get Company Profile

**GET** `/api/v1/company/profile`

**Description:** Get company profile information

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Company profile retrieved successfully",
  "data": {
    "id": "company_123",
    "name": "ABC Shipping Co",
    "email": "contact@abcshipping.com",
    "phone": "+1234567890",
    "address": {
      "street": "123 Shipping St",
      "city": "Shanghai",
      "state": "Shanghai",
      "country": "China",
      "postalCode": "200000"
    },
    "website": "https://abcshipping.com",
    "industry": "Shipping & Logistics",
    "size": "50-100",
    "description": "Leading ocean freight services provider",
    "isActive": true,
    "subscription": {
      "plan": "premium",
      "status": "active",
      "customerId": "cus_1234567890",
      "subscriptionId": "sub_1234567890"
    },
    "settings": {
      "timezone": "Asia/Shanghai",
      "currency": "USD",
      "language": "en",
      "notifications": {
        "email": true,
        "sms": false,
        "push": true
      }
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Profile retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 2. Update Company Profile

**PUT** `/api/v1/company/profile`

**Description:** Update company profile information

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "ABC Shipping Co Ltd",
  "email": "contact@abcshipping.com",
  "phone": "+1234567890",
  "address": {
    "street": "456 New Shipping St",
    "city": "Shanghai",
    "state": "Shanghai",
    "country": "China",
    "postalCode": "200001"
  },
  "website": "https://abcshipping.com",
  "industry": "Shipping & Logistics",
  "size": "100-200",
  "description": "Leading ocean freight services provider with global reach"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Company profile updated successfully",
  "data": {
    "id": "company_123",
    "name": "ABC Shipping Co Ltd",
    "email": "contact@abcshipping.com",
    "phone": "+1234567890",
    "address": {
      "street": "456 New Shipping St",
      "city": "Shanghai",
      "state": "Shanghai",
      "country": "China",
      "postalCode": "200001"
    },
    "website": "https://abcshipping.com",
    "industry": "Shipping & Logistics",
    "size": "100-200",
    "description": "Leading ocean freight services provider with global reach",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Profile updated successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `500` - Internal server error

---

### 3. Get Company Settings

**GET** `/api/v1/company/settings`

**Description:** Get company settings

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Company settings retrieved successfully",
  "data": {
    "timezone": "Asia/Shanghai",
    "currency": "USD",
    "language": "en",
    "dateFormat": "MM/DD/YYYY",
    "timeFormat": "12h",
    "notifications": {
      "email": true,
      "sms": false,
      "push": true,
      "rfqCreated": true,
      "quoteReceived": true,
      "quoteAccepted": true,
      "quoteRejected": false,
      "trialEnding": true,
      "trialExpired": true,
      "paymentConfirmation": true
    },
    "privacy": {
      "dataSharing": false,
      "analytics": true,
      "marketing": false
    },
    "security": {
      "twoFactorAuth": false,
      "sessionTimeout": 30,
      "passwordPolicy": "strong"
    }
  }
}
```

**Status Codes:**

- `200` - Settings retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 4. Update Company Settings

**PUT** `/api/v1/company/settings`

**Description:** Update company settings

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "timezone": "Asia/Shanghai",
  "currency": "USD",
  "language": "en",
  "dateFormat": "MM/DD/YYYY",
  "timeFormat": "12h",
  "notifications": {
    "email": true,
    "sms": false,
    "push": true,
    "rfqCreated": true,
    "quoteReceived": true,
    "quoteAccepted": true,
    "quoteRejected": false,
    "trialEnding": true,
    "trialExpired": true,
    "paymentConfirmation": true
  },
  "privacy": {
    "dataSharing": false,
    "analytics": true,
    "marketing": false
  },
  "security": {
    "twoFactorAuth": true,
    "sessionTimeout": 60,
    "passwordPolicy": "strong"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Company settings updated successfully",
  "data": {
    "timezone": "Asia/Shanghai",
    "currency": "USD",
    "language": "en",
    "dateFormat": "MM/DD/YYYY",
    "timeFormat": "12h",
    "notifications": {
      "email": true,
      "sms": false,
      "push": true,
      "rfqCreated": true,
      "quoteReceived": true,
      "quoteAccepted": true,
      "quoteRejected": false,
      "trialEnding": true,
      "trialExpired": true,
      "paymentConfirmation": true
    },
    "privacy": {
      "dataSharing": false,
      "analytics": true,
      "marketing": false
    },
    "security": {
      "twoFactorAuth": true,
      "sessionTimeout": 60,
      "passwordPolicy": "strong"
    },
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Settings updated successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `500` - Internal server error

---

### 5. Get Company Statistics

**GET** `/api/v1/company/statistics`

**Description:** Get company statistics and metrics

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Company statistics retrieved successfully",
  "data": {
    "overview": {
      "totalUsers": 25,
      "totalRFQs": 100,
      "totalQuotes": 200,
      "totalContacts": 50,
      "totalEmails": 500,
      "totalRevenue": 1000000
    },
    "activity": {
      "lastLogin": "2024-01-01T10:30:00.000Z",
      "activeUsers": 20,
      "dailyActiveUsers": 15,
      "weeklyActiveUsers": 18
    },
    "performance": {
      "rfqCompletionRate": 80,
      "quoteAcceptanceRate": 25,
      "emailOpenRate": 65.2,
      "contactEngagementRate": 75
    },
    "growth": {
      "newUsersThisMonth": 5,
      "newRFQsThisMonth": 20,
      "newQuotesThisMonth": 40,
      "newContactsThisMonth": 10
    }
  }
}
```

**Status Codes:**

- `200` - Statistics retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 6. Get Company Activity Log

**GET** `/api/v1/company/activity`

**Description:** Get company activity log

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `startDate` (optional): Start date (ISO format)
- `endDate` (optional): End date (ISO format)

**Response:**

```json
{
  "success": true,
  "message": "Company activity retrieved successfully",
  "data": {
    "activities": [
      {
        "id": "activity_123",
        "type": "profile_updated",
        "description": "Company profile updated by John Doe",
        "userId": "user_123",
        "userName": "John Doe",
        "timestamp": "2024-01-01T10:30:00.000Z",
        "metadata": {
          "field": "name",
          "oldValue": "ABC Shipping Co",
          "newValue": "ABC Shipping Co Ltd"
        }
      },
      {
        "id": "activity_124",
        "type": "user_created",
        "description": "New user Jane Smith created",
        "userId": "user_124",
        "userName": "Jane Smith",
        "timestamp": "2024-01-01T09:15:00.000Z",
        "metadata": {
          "role": "user",
          "department": "Operations"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

**Status Codes:**

- `200` - Activity retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 7. Export Company Data

**GET** `/api/v1/company/export`

**Description:** Export company data

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Query Parameters:**

- `format` (optional): Export format - json/csv (default: json)
- `dataType` (optional): Data type to export - all/rfqs/quotes/contacts (default: all)

**Response:**

```json
{
  "success": true,
  "message": "Company data export initiated successfully",
  "data": {
    "exportId": "export_123",
    "status": "processing",
    "downloadUrl": "https://yourdomain.com/exports/company_data_123.json",
    "expiresAt": "2024-01-02T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Export initiated successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 8. Get Company Health Check

**GET** `/api/v1/company/health`

**Description:** Get company health status

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Company health check completed successfully",
  "data": {
    "status": "healthy",
    "subscription": {
      "status": "ACTIVE",
      "trialEndsAt": null,
      "daysUntilRenewal": 15
    },
    "usage": {
      "rfqUsage": 10,
      "rfqLimit": 1000,
      "quoteUsage": 20,
      "quoteLimit": 2000,
      "contactUsage": 5,
      "contactLimit": 500,
      "emailUsage": 50,
      "emailLimit": 10000
    },
    "alerts": [
      {
        "type": "info",
        "message": "All systems operational",
        "timestamp": "2024-01-01T10:00:00.000Z"
      }
    ],
    "lastBackup": "2024-01-01T00:00:00.000Z",
    "dataRetention": "2 years"
  }
}
```

**Status Codes:**

- `200` - Health check completed successfully
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

## Company Sizes

- **1-10**: Small company
- **11-50**: Medium company
- **51-100**: Large company
- **100-200**: Enterprise
- **200+**: Corporate

## Industries

- **Shipping & Logistics**: Shipping and logistics companies
- **Manufacturing**: Manufacturing companies
- **Technology**: Technology companies
- **Retail**: Retail companies
- **Healthcare**: Healthcare companies
- **Other**: Other industries

## Timezones

- **UTC**: Coordinated Universal Time
- **Asia/Shanghai**: China Standard Time
- **America/New_York**: Eastern Time
- **Europe/London**: Greenwich Mean Time
- **Asia/Tokyo**: Japan Standard Time

## Notes

- All company operations are logged for audit
- Profile updates trigger email notifications
- Settings changes are applied immediately
- Data exports are processed asynchronously
- All timestamps are in ISO 8601 format
