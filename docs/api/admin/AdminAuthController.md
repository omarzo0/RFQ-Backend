# Admin Authentication Controller

## Overview

Handles admin authentication, login, profile management, and password operations.

## Endpoints

### 1. Admin Login

**POST** `/api/v1/admin/auth/login`

**Description:** Authenticate admin user and return JWT token

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "admin": {
      "id": "admin_id",
      "email": "admin@example.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "super_admin"
    },
    "token": "jwt_token_here"
  }
}
```

**Status Codes:**

- `200` - Login successful
- `400` - Invalid credentials or missing fields
- `401` - Authentication failed
- `500` - Internal server error

---

### 2. Get Admin Profile

**GET** `/api/v1/admin/auth/profile`

**Description:** Get current admin user profile

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Admin profile retrieved successfully",
  "data": {
    "id": "admin_id",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "super_admin",
    "isActive": true,
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

### 3. Update Admin Profile

**PUT** `/api/v1/admin/auth/profile`

**Description:** Update admin user profile

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "email": "updated@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Admin profile updated successfully",
  "data": {
    "id": "admin_id",
    "email": "updated@example.com",
    "firstName": "Updated",
    "lastName": "Name",
    "role": "super_admin",
    "isActive": true,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Profile updated successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `500` - Internal server error

---

### 4. Change Admin Password

**PUT** `/api/v1/admin/auth/change-password`

**Description:** Change admin user password

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "message": "Password updated successfully"
  }
}
```

**Status Codes:**

- `200` - Password changed successfully
- `400` - Invalid input data or current password incorrect
- `401` - Unauthorized
- `500` - Internal server error

---

### 5. Logout Admin

**POST** `/api/v1/admin/auth/logout`

**Description:** Logout admin user (invalidate token)

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Admin logged out successfully",
  "data": {
    "message": "Logged out successfully"
  }
}
```

**Status Codes:**

- `200` - Logout successful
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

Most endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Notes

- All passwords must meet security requirements
- JWT tokens expire after a configured period
- Profile updates are logged for audit purposes
- Password changes require current password verification
