# Admin Management Controller

## Overview

Handles admin user management operations including creation, updates, deletion, and role management.

## Endpoints

### 1. Create Admin

**POST** `/api/v1/admin/management/admins`

**Description:** Create a new admin user

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "newadmin@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "admin",
  "isActive": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Admin created successfully",
  "data": {
    "id": "admin_123",
    "email": "newadmin@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `201` - Admin created successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `409` - Admin already exists
- `500` - Internal server error

---

### 2. Get All Admins

**GET** `/api/v1/admin/management/admins`

**Description:** Get all admin users with filtering and pagination

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `role` (optional): Filter by admin role
- `isActive` (optional): Filter by active status (true/false)
- `search` (optional): Search by name or email

**Response:**

```json
{
  "success": true,
  "message": "Admins retrieved successfully",
  "data": {
    "admins": [
      {
        "id": "admin_123",
        "email": "admin@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "super_admin",
        "isActive": true,
        "lastLogin": "2024-01-01T10:30:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

**Status Codes:**

- `200` - Admins retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 3. Get Admin by ID

**GET** `/api/v1/admin/management/admins/:id`

**Description:** Get detailed information about a specific admin

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**

- `id`: Admin ID

**Response:**

```json
{
  "success": true,
  "message": "Admin retrieved successfully",
  "data": {
    "id": "admin_123",
    "email": "admin@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "super_admin",
    "isActive": true,
    "lastLogin": "2024-01-01T10:30:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "permissions": [
      "manage_companies",
      "manage_users",
      "view_analytics",
      "manage_subscriptions"
    ]
  }
}
```

**Status Codes:**

- `200` - Admin retrieved successfully
- `401` - Unauthorized
- `404` - Admin not found
- `500` - Internal server error

---

### 4. Update Admin

**PUT** `/api/v1/admin/management/admins/:id`

**Description:** Update an existing admin user

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: Admin ID

**Request Body:**

```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "email": "updated@example.com",
  "role": "admin",
  "isActive": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Admin updated successfully",
  "data": {
    "id": "admin_123",
    "email": "updated@example.com",
    "firstName": "Updated",
    "lastName": "Name",
    "role": "admin",
    "isActive": true,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Admin updated successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - Admin not found
- `500` - Internal server error

---

### 5. Delete Admin

**DELETE** `/api/v1/admin/management/admins/:id`

**Description:** Delete an admin user (soft delete)

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**

- `id`: Admin ID

**Response:**

```json
{
  "success": true,
  "message": "Admin deleted successfully",
  "data": {
    "id": "admin_123",
    "isActive": false,
    "deletedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Admin deleted successfully
- `401` - Unauthorized
- `404` - Admin not found
- `403` - Cannot delete super admin
- `500` - Internal server error

---

### 6. Change Admin Password

**PUT** `/api/v1/admin/management/admins/:id/password`

**Description:** Change an admin's password

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: Admin ID

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
  "message": "Admin password changed successfully",
  "data": {
    "id": "admin_123",
    "passwordChangedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Password changed successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - Admin not found
- `500` - Internal server error

---

### 7. Activate/Deactivate Admin

**PATCH** `/api/v1/admin/management/admins/:id/status`

**Description:** Activate or deactivate an admin user

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: Admin ID

**Request Body:**

```json
{
  "isActive": false
}
```

**Response:**

```json
{
  "success": true,
  "message": "Admin status updated successfully",
  "data": {
    "id": "admin_123",
    "isActive": false,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Status updated successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - Admin not found
- `500` - Internal server error

---

### 8. Get Admin Roles

**GET** `/api/v1/admin/management/roles`

**Description:** Get available admin roles and their permissions

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Admin roles retrieved successfully",
  "data": {
    "roles": [
      {
        "role": "super_admin",
        "name": "Super Administrator",
        "description": "Full system access",
        "permissions": [
          "manage_companies",
          "manage_users",
          "manage_admins",
          "view_analytics",
          "manage_subscriptions",
          "manage_financials",
          "system_settings"
        ]
      },
      {
        "role": "admin",
        "name": "Administrator",
        "description": "Standard admin access",
        "permissions": [
          "manage_companies",
          "manage_users",
          "view_analytics",
          "manage_subscriptions"
        ]
      },
      {
        "role": "support",
        "name": "Support Agent",
        "description": "Limited support access",
        "permissions": ["view_companies", "manage_tickets"]
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

### 9. Get Admin Activity Log

**GET** `/api/v1/admin/management/admins/:id/activity`

**Description:** Get activity log for a specific admin

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**

- `id`: Admin ID

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `startDate` (optional): Start date (ISO format)
- `endDate` (optional): End date (ISO format)

**Response:**

```json
{
  "success": true,
  "message": "Admin activity log retrieved successfully",
  "data": {
    "activities": [
      {
        "id": "activity_123",
        "action": "company_created",
        "description": "Created new company 'Tech Corp'",
        "timestamp": "2024-01-01T10:30:00.000Z",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0..."
      },
      {
        "id": "activity_124",
        "action": "admin_updated",
        "description": "Updated admin user profile",
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

- `200` - Activity log retrieved successfully
- `401` - Unauthorized
- `404` - Admin not found
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

## Admin Roles

### Super Admin

- Full system access
- Can manage all admins
- Can access all features
- Cannot be deleted

### Admin

- Standard admin access
- Can manage companies and users
- Cannot manage other admins
- Can be deleted

### Support

- Limited access
- Can view companies and manage tickets
- Cannot access financial data
- Can be deleted

## Notes

- All admin operations are logged for audit
- Super admins cannot be deleted
- Password changes require strong passwords
- Admin deactivation prevents login
- Activity logs are retained for 1 year
