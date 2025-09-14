# Admin Password Reset Controller

## Overview

Handles password reset operations for admin users including password reset requests, OTP verification, and password updates.

## Endpoints

### 1. Request Password Reset

**POST** `/api/v1/admin/auth/forgot-password`

**Description:** Request a password reset for an admin user

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

**Status Codes:**

- `200` - Password reset request successful
- `400` - Invalid input data
- `404` - Admin not found
- `429` - Too many requests
- `500` - Internal server error

---

### 2. Reset Password

**POST** `/api/v1/admin/auth/reset-password`

**Description:** Reset admin password using OTP verification

**Request Body:**

```json
{
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

**Status Codes:**

- `200` - Password reset successful
- `400` - Invalid input data or OTP
- `401` - Invalid or expired OTP
- `500` - Internal server error

---

### 3. Verify OTP

**POST** `/api/v1/admin/auth/verify-otp`

**Description:** Verify OTP for password reset

**Request Body:**

```json
{
  "otp": "123456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "message": "OTP verified successfully",
    "token": "reset_token_here"
  }
}
```

**Status Codes:**

- `200` - OTP verified successfully
- `400` - Invalid input data
- `401` - Invalid or expired OTP
- `500` - Internal server error

---

### 4. Resend OTP

**POST** `/api/v1/admin/auth/resend-otp`

**Description:** Resend password reset OTP

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
  "message": "OTP resent successfully",
  "data": {
    "message": "OTP resent successfully",
    "expiresIn": 900
  }
}
```

**Status Codes:**

- `200` - OTP resent successfully
- `400` - Invalid input data
- `404` - Admin not found
- `429` - Too many requests
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

Most endpoints do not require authentication, except for password reset operations that use the reset token.

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
- Secure password hashing
- Email verification required
- Audit logging for all operations

## Notes

- Password reset requests are rate-limited
- OTP is sent to the admin's registered email
- All password reset operations are logged
- Invalid OTP attempts are tracked
- Password reset tokens are single-use
