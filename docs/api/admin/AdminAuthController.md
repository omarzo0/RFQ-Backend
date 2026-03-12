# Admin Authentication Controller

## Overview

Unified controller that handles all admin authentication operations including login, profile management, token management, and password reset. This controller consolidates the auth and password reset functionality into a single controller.

**Controller:** `AdminAuthController`
**Route File:** `adminAuth.ts` (`/api/v1/admin/auth/*`)

---

## Public Routes (No Authentication Required)

---

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

**Status Codes:** `200` Login successful · `400` Invalid credentials or missing fields · `401` Authentication failed · `500` Internal Server Error

---

### 2. Refresh Token

**POST** `/api/v1/admin/auth/refresh-token`

**Description:** Refresh an expired JWT token

**Request Body:**

```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "new_jwt_token_here",
    "refreshToken": "new_refresh_token_here"
  }
}
```

**Status Codes:** `200` Token refreshed · `400` Invalid token · `401` Expired or invalid refresh token · `500` Internal Server Error

---

### 3. Request Password Reset (Forgot Password)

**POST** `/api/v1/admin/auth/forgot-password`

**Description:** Request a password reset OTP for an admin user

**Validation:**

- `email` — must be a valid email (normalized)

**Request Body:**

```json
{
  "email": "admin@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password reset OTP sent to your email",
  "data": {
    "message": "Password reset OTP sent to your email",
    "expiresIn": 900
  }
}
```

**Status Codes:** `200` OTP sent successfully · `400` Invalid input data · `404` Admin not found · `429` Too many requests · `500` Internal Server Error

---

### 4. Reset Password

**POST** `/api/v1/admin/auth/reset-password`

**Description:** Reset admin password using email and OTP verification

**Validation:**

- `email` — must be a valid email (normalized)
- `otp` — must be exactly 6 digits
- `newPassword` — must be at least 8 characters

**Request Body:**

```json
{
  "email": "admin@example.com",
  "otp": "123456",
  "newPassword": "newSecurePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": {
    "message": "Password reset successfully"
  }
}
```

**Status Codes:** `200` Password reset successful · `400` Invalid input data or OTP · `401` Invalid or expired OTP · `500` Internal Server Error

---

## Protected Routes (Authentication Required)

All routes below require the `Authorization: Bearer <jwt_token>` header.

---

### 5. Get Admin Profile

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

**Status Codes:** `200` Profile retrieved · `401` Unauthorized · `500` Internal Server Error

---

### 6. Update Admin Profile

**PUT** `/api/v1/admin/auth/profile`

**Description:** Update the currently logged-in admin's profile information. At least one field must be provided.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Validation:**

- `firstName` _(optional)_ — non-empty string, trimmed
- `lastName` _(optional)_ — non-empty string, trimmed
- `email` _(optional)_ — valid email, normalized

**Request Body:**

```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "email": "newemail@example.com"
}
```

> You can send any combination of the three fields. At least one is required.

**Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "admin_id",
    "email": "newemail@example.com",
    "firstName": "Updated",
    "lastName": "Name",
    "role": "super_admin",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-03-11T12:00:00.000Z"
  }
}
```

**Error Examples:**

```json
{
  "success": false,
  "message": "At least one field (firstName, lastName, email) is required",
  "statusCode": 400
}
```

```json
{
  "success": false,
  "message": "Email is already in use by another admin",
  "statusCode": 409
}
```

**Status Codes:** `200` Profile updated · `400` No fields provided or invalid input · `401` Unauthorized · `409` Email already in use · `500` Internal Server Error

---

### 7. Update Admin Password

**PUT** `/api/v1/admin/auth/password`

**Description:** Change the currently logged-in admin's password. Requires the current password for verification. On success, **all existing sessions (refresh tokens) are revoked** — the admin must log in again.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Validation:**

- `currentPassword` — required, non-empty
- `newPassword` — required, minimum 8 characters

**Request Body:**

```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password updated successfully. All sessions have been revoked — please log in again.",
  "data": null
}
```

**Error Examples:**

```json
{
  "success": false,
  "message": "Current password is incorrect",
  "statusCode": 401
}
```

```json
{
  "success": false,
  "message": "New password must be different from the current password",
  "statusCode": 400
}
```

**Status Codes:** `200` Password updated · `400` Missing fields / password too short / same password · `401` Unauthorized or incorrect current password · `500` Internal Server Error

> ⚠️ **Important:** After a successful password change, all refresh tokens are revoked. The frontend should redirect the user to the login page.

---

### 8. Logout Admin

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

**Status Codes:** `200` Logout successful · `401` Unauthorized · `500` Internal Server Error

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

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## OTP Details

- OTP is 6 digits
- Valid for 15 minutes
- Can be resent up to 3 times per hour
- OTP is sent via email

## Security Features

- Rate limiting on password reset requests
- OTP expiration after 15 minutes
- Secure password hashing (bcrypt)
- Email verification required for password reset
- Audit logging for all authentication operations
- JWT tokens expire after a configured period

## Notes

- Profile updates are logged for audit purposes
- Invalid OTP attempts are tracked
- Password reset tokens are single-use
- All password reset operations are logged
