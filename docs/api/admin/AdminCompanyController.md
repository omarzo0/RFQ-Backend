# Admin Company Controller

## Overview

Handles company management operations for admin users including creation, updates, deletion, and analytics.

## Endpoints

### 1. Create Company

**POST** `/api/v1/admin/companies`

**Description:** Create a new company with trial subscription

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Company Name",
  "email": "company@example.com",
  "phone": "+1234567890",
  "address": "123 Main St, City, State",
  "website": "https://company.com",
  "industry": "Technology",
  "size": "10-50",
  "description": "Company description"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Company created successfully",
  "data": {
    "id": "company_id",
    "name": "Company Name",
    "email": "company@example.com",
    "phone": "+1234567890",
    "address": "123 Main St, City, State",
    "website": "https://company.com",
    "industry": "Technology",
    "size": "10-50",
    "description": "Company description",
    "subscriptionPlan": "trial",
    "subscriptionStatus": "ACTIVE",
    "trialEndsAt": "2024-02-01T00:00:00.000Z",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `201` - Company created successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `409` - Company already exists
- `500` - Internal server error

---

### 2. Get All Companies

**GET** `/api/v1/admin/companies`

**Description:** Get paginated list of all companies

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term for name or email
- `status` (optional): Filter by subscription status
- `plan` (optional): Filter by subscription plan

**Response:**

```json
{
  "success": true,
  "message": "Companies retrieved successfully",
  "data": {
    "companies": [
      {
        "id": "company_id",
        "name": "Company Name",
        "email": "company@example.com",
        "subscriptionPlan": "trial",
        "subscriptionStatus": "ACTIVE",
        "trialEndsAt": "2024-02-01T00:00:00.000Z",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

**Status Codes:**

- `200` - Companies retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 3. Get Company by ID

**GET** `/api/v1/admin/companies/:id`

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
  "message": "Company retrieved successfully",
  "data": {
    "id": "company_id",
    "name": "Company Name",
    "email": "company@example.com",
    "phone": "+1234567890",
    "address": "123 Main St, City, State",
    "website": "https://company.com",
    "industry": "Technology",
    "size": "10-50",
    "description": "Company description",
    "subscriptionPlan": "trial",
    "subscriptionStatus": "ACTIVE",
    "trialEndsAt": "2024-02-01T00:00:00.000Z",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "users": [
      {
        "id": "user_id",
        "email": "user@company.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "admin",
        "isActive": true
      }
    ]
  }
}
```

**Status Codes:**

- `200` - Company retrieved successfully
- `401` - Unauthorized
- `404` - Company not found
- `500` - Internal server error

---

### 4. Update Company

**PUT** `/api/v1/admin/companies/:id`

**Description:** Update company information

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: Company ID

**Request Body:**

```json
{
  "name": "Updated Company Name",
  "email": "updated@company.com",
  "phone": "+1234567890",
  "address": "456 New St, City, State",
  "website": "https://updated-company.com",
  "industry": "Finance",
  "size": "50-100",
  "description": "Updated description"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Company updated successfully",
  "data": {
    "id": "company_id",
    "name": "Updated Company Name",
    "email": "updated@company.com",
    "phone": "+1234567890",
    "address": "456 New St, City, State",
    "website": "https://updated-company.com",
    "industry": "Finance",
    "size": "50-100",
    "description": "Updated description",
    "subscriptionPlan": "trial",
    "subscriptionStatus": "ACTIVE",
    "trialEndsAt": "2024-02-01T00:00:00.000Z",
    "isActive": true,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Company updated successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - Company not found
- `500` - Internal server error

---

### 5. Delete Company

**DELETE** `/api/v1/admin/companies/:id`

**Description:** Soft delete a company (deactivate)

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
  "message": "Company deleted successfully",
  "data": {
    "id": "company_id",
    "isActive": false,
    "deletedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Company deleted successfully
- `401` - Unauthorized
- `404` - Company not found
- `500` - Internal server error

---

### 6. Get Company Analytics

**GET** `/api/v1/admin/companies/:id/analytics`

**Description:** Get analytics data for a specific company

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**

- `id`: Company ID

**Query Parameters:**

- `period` (optional): Time period (7d, 30d, 90d, 1y)
- `startDate` (optional): Start date (ISO format)
- `endDate` (optional): End date (ISO format)

**Response:**

```json
{
  "success": true,
  "message": "Company analytics retrieved successfully",
  "data": {
    "companyId": "company_id",
    "period": "30d",
    "rfqs": {
      "total": 150,
      "active": 45,
      "completed": 100,
      "cancelled": 5
    },
    "quotes": {
      "total": 300,
      "sent": 250,
      "accepted": 50,
      "rejected": 200
    },
    "emails": {
      "total": 500,
      "sent": 450,
      "opened": 300,
      "clicked": 150
    },
    "revenue": {
      "total": 50000,
      "currency": "USD",
      "monthly": 15000
    }
  }
}
```

**Status Codes:**

- `200` - Analytics retrieved successfully
- `401` - Unauthorized
- `404` - Company not found
- `500` - Internal server error

---

### 7. Update Company Subscription

**PUT** `/api/v1/admin/companies/:id/subscription`

**Description:** Update company subscription plan

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: Company ID

**Request Body:**

```json
{
  "subscriptionPlan": "premium",
  "subscriptionStatus": "ACTIVE",
  "trialEndsAt": "2024-02-01T00:00:00.000Z"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Company subscription updated successfully",
  "data": {
    "id": "company_id",
    "subscriptionPlan": "premium",
    "subscriptionStatus": "ACTIVE",
    "trialEndsAt": "2024-02-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Subscription updated successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - Company not found
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

- Company creation automatically sets up a 30-day trial
- Soft delete preserves data but deactivates the company
- All company operations are logged for audit purposes
- Subscription changes trigger email notifications
