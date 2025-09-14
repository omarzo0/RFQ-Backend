# Company User Controller

## Overview

Handles user management for company users including creation, updates, and user administration within the company.

## Endpoints

### 1. Get All Users

**GET** `/api/v1/company/users`

**Description:** Get all users for the company with filtering and pagination

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or email
- `role` (optional): Filter by user role
- `status` (optional): Filter by user status

**Response:**

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "user_123",
        "email": "john.doe@company.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "admin",
        "status": "active",
        "lastLogin": "2024-01-01T10:30:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    },
    "summary": {
      "total": 25,
      "active": 23,
      "inactive": 2,
      "admin": 5,
      "user": 20
    }
  }
}
```

**Status Codes:**

- `200` - Users retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 2. Get User by ID

**GET** `/api/v1/company/users/:id`

**Description:** Get detailed information about a specific user

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Path Parameters:**

- `id`: User ID

**Response:**

```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "user_123",
    "email": "john.doe@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin",
    "status": "active",
    "lastLogin": "2024-01-01T10:30:00.000Z",
    "permissions": [
      "manage_users",
      "manage_rfqs",
      "manage_quotes",
      "view_analytics"
    ],
    "profile": {
      "phone": "+1234567890",
      "department": "Sales",
      "position": "Sales Manager",
      "avatar": "https://yourdomain.com/avatars/user_123.jpg"
    },
    "activity": {
      "totalRFQs": 50,
      "totalQuotes": 100,
      "totalEmails": 200,
      "lastActivity": "2024-01-01T10:30:00.000Z"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - User retrieved successfully
- `401` - Unauthorized
- `404` - User not found
- `500` - Internal server error

---

### 3. Create User

**POST** `/api/v1/company/users`

**Description:** Create a new user

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "jane.smith@company.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "user",
  "password": "securePassword123",
  "profile": {
    "phone": "+1234567890",
    "department": "Operations",
    "position": "Operations Manager"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "user_124",
    "email": "jane.smith@company.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "user",
    "status": "active",
    "profile": {
      "phone": "+1234567890",
      "department": "Operations",
      "position": "Operations Manager"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `201` - User created successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `409` - User already exists
- `500` - Internal server error

---

### 4. Update User

**PUT** `/api/v1/company/users/:id`

**Description:** Update an existing user

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: User ID

**Request Body:**

```json
{
  "firstName": "Jane",
  "lastName": "Johnson",
  "role": "admin",
  "profile": {
    "phone": "+1234567890",
    "department": "Sales",
    "position": "Senior Sales Manager"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "user_124",
    "firstName": "Jane",
    "lastName": "Johnson",
    "role": "admin",
    "profile": {
      "phone": "+1234567890",
      "department": "Sales",
      "position": "Senior Sales Manager"
    },
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - User updated successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - User not found
- `500` - Internal server error

---

### 5. Delete User

**DELETE** `/api/v1/company/users/:id`

**Description:** Delete a user

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Path Parameters:**

- `id`: User ID

**Response:**

```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "id": "user_124",
    "deletedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - User deleted successfully
- `401` - Unauthorized
- `404` - User not found
- `500` - Internal server error

---

### 6. Update User Status

**PATCH** `/api/v1/company/users/:id/status`

**Description:** Update user status

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: User ID

**Request Body:**

```json
{
  "status": "inactive",
  "reason": "User left the company"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User status updated successfully",
  "data": {
    "id": "user_124",
    "status": "inactive",
    "reason": "User left the company",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Status updated successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - User not found
- `500` - Internal server error

---

### 7. Change User Password

**PUT** `/api/v1/company/users/:id/password`

**Description:** Change user password

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: User ID

**Request Body:**

```json
{
  "newPassword": "newSecurePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User password changed successfully",
  "data": {
    "id": "user_124",
    "passwordChangedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Password changed successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - User not found
- `500` - Internal server error

---

### 8. Get User Roles

**GET** `/api/v1/company/users/roles`

**Description:** Get available user roles and permissions

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "User roles retrieved successfully",
  "data": {
    "roles": [
      {
        "role": "admin",
        "name": "Administrator",
        "description": "Full access to all features",
        "permissions": [
          "manage_users",
          "manage_rfqs",
          "manage_quotes",
          "manage_contacts",
          "manage_templates",
          "view_analytics",
          "manage_settings"
        ]
      },
      {
        "role": "user",
        "name": "Standard User",
        "description": "Standard user access",
        "permissions": [
          "manage_rfqs",
          "manage_quotes",
          "manage_contacts",
          "view_analytics"
        ]
      },
      {
        "role": "viewer",
        "name": "Viewer",
        "description": "Read-only access",
        "permissions": [
          "view_rfqs",
          "view_quotes",
          "view_contacts",
          "view_analytics"
        ]
      }
    ]
  }
}
```

**Status Codes:**

- `200` - Roles retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 9. Get User Activity

**GET** `/api/v1/company/users/:id/activity`

**Description:** Get user activity log

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Path Parameters:**

- `id`: User ID

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `startDate` (optional): Start date (ISO format)
- `endDate` (optional): End date (ISO format)

**Response:**

```json
{
  "success": true,
  "message": "User activity retrieved successfully",
  "data": {
    "activities": [
      {
        "id": "activity_123",
        "action": "rfq_created",
        "description": "Created new RFQ: Ocean Freight from Shanghai to Los Angeles",
        "timestamp": "2024-01-01T10:30:00.000Z",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0..."
      },
      {
        "id": "activity_124",
        "action": "quote_sent",
        "description": "Sent quote to John Doe at ABC Shipping Co",
        "timestamp": "2024-01-01T09:15:00.000Z",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0..."
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
- `404` - User not found
- `500` - Internal server error

---

### 10. Get User Statistics

**GET** `/api/v1/company/users/statistics`

**Description:** Get user statistics and metrics

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "User statistics retrieved successfully",
  "data": {
    "overview": {
      "totalUsers": 25,
      "activeUsers": 23,
      "inactiveUsers": 2,
      "adminUsers": 5,
      "regularUsers": 20
    },
    "byRole": [
      {
        "role": "admin",
        "count": 5,
        "percentage": 20
      },
      {
        "role": "user",
        "count": 18,
        "percentage": 72
      },
      {
        "role": "viewer",
        "count": 2,
        "percentage": 8
      }
    ],
    "byDepartment": [
      {
        "department": "Sales",
        "count": 10,
        "percentage": 40
      },
      {
        "department": "Operations",
        "count": 8,
        "percentage": 32
      },
      {
        "department": "Management",
        "count": 7,
        "percentage": 28
      }
    ],
    "activity": {
      "activeToday": 20,
      "activeThisWeek": 22,
      "activeThisMonth": 23,
      "averageSessionDuration": 1800
    },
    "topPerformers": [
      {
        "userId": "user_123",
        "userName": "John Doe",
        "rfqCount": 50,
        "quoteCount": 100,
        "emailCount": 200
      }
    ]
  }
}
```

**Status Codes:**

- `200` - Statistics retrieved successfully
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

## User Roles

### Admin

- Full access to all features
- Can manage users
- Can access all data
- Can modify settings

### User

- Standard user access
- Can manage RFQs, quotes, contacts
- Can view analytics
- Cannot manage users

### Viewer

- Read-only access
- Can view data but cannot modify
- Cannot access sensitive operations

## User Statuses

- **active**: User is active and can login
- **inactive**: User is inactive and cannot login
- **suspended**: User is temporarily suspended
- **archived**: User is archived

## Notes

- All user operations are logged for audit
- User creation triggers welcome email
- Password changes require strong passwords
- User deactivation prevents login
- Activity logs are retained for 1 year
- All timestamps are in ISO 8601 format
