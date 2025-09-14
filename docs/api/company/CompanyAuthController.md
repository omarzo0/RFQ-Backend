# Company Authentication Controller

## Overview

Handles company user authentication, login, profile management, and password operations.

## Endpoints

### 1. Company User Login

**POST** `/api/v1/company/auth/login`

**Description:** Authenticate company user and return JWT token

**Request Body:**

```json
{
  "email": "user@company.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Company user login successful",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@company.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "companyId": "company_id"
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

### 2. Get Company User Profile

**GET** `/api/v1/company/auth/profile`

**Description:** Get current company user profile

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Company user profile retrieved successfully",
  "data": {
    "id": "user_id",
    "email": "user@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin",
    "companyId": "company_id",
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

### 3. Update Company User Profile

**PUT** `/api/v1/company/auth/profile`

**Description:** Update company user profile

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "email": "updated@company.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Company user profile updated successfully",
  "data": {
    "id": "user_id",
    "email": "updated@company.com",
    "firstName": "Updated",
    "lastName": "Name",
    "role": "admin",
    "companyId": "company_id",
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

### 4. Change Company User Password

**PUT** `/api/v1/company/auth/change-password`

**Description:** Change company user password

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

### 5. Logout Company User

**POST** `/api/v1/company/auth/logout`

**Description:** Logout company user (invalidate token)

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Company user logged out successfully",
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
- Company users are tied to specific companies
