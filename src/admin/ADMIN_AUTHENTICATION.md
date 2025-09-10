# Admin Authentication System

This document describes the complete admin authentication system for the RFQ platform.

## 🔐 **Authentication Overview**

The admin authentication system provides secure access control for admin users with the following features:

- **JWT-based authentication** with access and refresh tokens
- **Role-based access control** (ADMIN, SUPER_ADMIN)
- **Password security** with bcrypt hashing
- **Token refresh mechanism** for extended sessions
- **Secure logout** with token revocation
- **Password change** functionality

## 🏗️ **System Architecture**

### **Components**

1. **AdminAuthController** - Handles HTTP requests for authentication
2. **AdminAuthService** - Business logic for authentication operations
3. **JWTUtils** - JWT token generation and verification
4. **PasswordUtils** - Password hashing and validation
5. **adminAuth middleware** - Authentication and authorization middleware

### **Database Schema**

```sql
-- Admin table
CREATE TABLE "Admin" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "role" "AdminRole" NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "lastLoginAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Refresh tokens table
CREATE TABLE "RefreshToken" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "tokenHash" TEXT NOT NULL,
  "adminUserId" TEXT,
  "companyUserId" TEXT,
  "userType" "UserType" NOT NULL,
  "companyId" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "isRevoked" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 **API Endpoints**

### **Authentication Endpoints**

```http
# Public endpoints
POST   /api/v1/admin/auth/login              # Admin login
POST   /api/v1/admin/auth/refresh-token      # Refresh access token

# Protected endpoints (require authentication)
GET    /api/v1/admin/auth/profile            # Get admin profile
POST   /api/v1/admin/auth/change-password    # Change password
POST   /api/v1/admin/auth/logout             # Admin logout
```

## 📝 **Request/Response Examples**

### **1. Admin Login**

**Request:**

```http
POST /api/v1/admin/auth/login
Content-Type: application/json

{
  "email": "superadmin@rfqplatform.com",
  "password": "admin123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "admin": {
      "id": "admin-uuid",
      "email": "superadmin@rfqplatform.com",
      "firstName": "Super",
      "lastName": "Admin",
      "role": "SUPER_ADMIN",
      "isActive": true,
      "lastLoginAt": "2024-01-15T10:30:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0..."
    }
  },
  "message": "Admin login successful"
}
```

### **2. Get Admin Profile**

**Request:**

```http
GET /api/v1/admin/auth/profile
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "admin-uuid",
    "email": "superadmin@rfqplatform.com",
    "firstName": "Super",
    "lastName": "Admin",
    "role": "SUPER_ADMIN",
    "isActive": true,
    "lastLoginAt": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Admin profile retrieved successfully"
}
```

### **3. Change Password**

**Request:**

```http
POST /api/v1/admin/auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "admin123",
  "newPassword": "NewSecurePassword123!"
}
```

**Response:**

```json
{
  "success": true,
  "data": null,
  "message": "Password changed successfully"
}
```

### **4. Refresh Token**

**Request:**

```http
POST /api/v1/admin/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0..."
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1..."
  },
  "message": "Token refreshed successfully"
}
```

### **5. Admin Logout**

**Request:**

```http
POST /api/v1/admin/auth/logout
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "success": true,
  "data": null,
  "message": "Admin logged out successfully"
}
```

## 🔒 **Security Features**

### **Password Security**

- **Bcrypt hashing** with 12 salt rounds
- **Password validation** with strength requirements:
  - Minimum 8 characters
  - At least one lowercase letter
  - At least one uppercase letter
  - At least one number
  - At least one special character
- **Password change** requires current password verification
- **Token revocation** on password change

### **JWT Security**

- **Access tokens** expire in 12 hours (configurable)
- **Refresh tokens** expire in 7 days (configurable)
- **Token revocation** on logout and password change
- **Secure token storage** with bcrypt hashing for refresh tokens
- **Role-based claims** in JWT payload

### **Authentication Flow**

1. **Login** - Admin provides email/password
2. **Validation** - System validates credentials and account status
3. **Token Generation** - Access and refresh tokens are generated
4. **Token Storage** - Refresh token is hashed and stored in database
5. **Session Management** - Access token used for API requests
6. **Token Refresh** - Refresh token used to get new access token
7. **Logout** - All tokens are revoked

## 🛡️ **Middleware**

### **authenticateAdmin**

```typescript
// Protects admin routes
router.get("/dashboard", authenticateAdmin, controller.getDashboard);
```

**Features:**

- Validates JWT access token
- Checks user type is "ADMIN"
- Adds user info to request object
- Handles token expiration and invalidation

### **requireSuperAdmin**

```typescript
// Requires SUPER_ADMIN role
router.post("/management/admins", requireSuperAdmin, controller.createAdmin);
```

**Features:**

- Must be called after `authenticateAdmin`
- Validates user role is "SUPER_ADMIN"
- Blocks access for regular "ADMIN" users

### **requireAdminOrSuperAdmin**

```typescript
// Requires ADMIN or SUPER_ADMIN role
router.get("/companies", requireAdminOrSuperAdmin, controller.getCompanies);
```

**Features:**

- Must be called after `authenticateAdmin`
- Validates user role is "ADMIN" or "SUPER_ADMIN"
- Allows access for both admin types

## 🧪 **Testing**

### **Run Authentication Tests**

```bash
# Create super admin first
npx ts-node src/admin/scripts/createSuperAdmin.ts

# Run authentication tests
node scripts/test-admin-auth.js
```

### **Manual Testing with cURL**

```bash
# 1. Login
curl -X POST http://localhost:3000/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@rfqplatform.com",
    "password": "admin123"
  }'

# 2. Get profile (replace TOKEN with actual token)
curl -X GET http://localhost:3000/api/v1/admin/auth/profile \
  -H "Authorization: Bearer TOKEN"

# 3. Change password
curl -X POST http://localhost:3000/api/v1/admin/auth/change-password \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "admin123",
    "newPassword": "NewSecurePassword123!"
  }'

# 4. Refresh token
curl -X POST http://localhost:3000/api/v1/admin/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "REFRESH_TOKEN"
  }'

# 5. Logout
curl -X POST http://localhost:3000/api/v1/admin/auth/logout \
  -H "Authorization: Bearer TOKEN"
```

## ⚙️ **Configuration**

### **Environment Variables**

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=12h
REFRESH_TOKEN_EXPIRES_IN=7d

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/rfq_platform
```

### **Token Configuration**

```typescript
// Access token expires in 12 hours
ACCESS_TOKEN_EXPIRES_IN = "12h";

// Refresh token expires in 7 days
REFRESH_TOKEN_EXPIRES_IN = "7d";

// Password hashing with 12 salt rounds
SALT_ROUNDS = 12;
```

## 🚨 **Error Handling**

### **Common Error Responses**

#### **401 Unauthorized**

```json
{
  "success": false,
  "error": "Invalid email or password",
  "code": "UNAUTHORIZED"
}
```

#### **403 Forbidden**

```json
{
  "success": false,
  "error": "Super admin access required",
  "code": "FORBIDDEN"
}
```

#### **400 Bad Request**

```json
{
  "success": false,
  "error": "Email and password are required",
  "code": "VALIDATION_ERROR"
}
```

## 🔧 **Troubleshooting**

### **Common Issues**

#### **"Invalid email or password"**

- Check if admin account exists
- Verify password is correct
- Ensure account is active (`isActive: true`)

#### **"Access token expired"**

- Use refresh token to get new access token
- Implement automatic token refresh in frontend

#### **"Super admin access required"**

- Check if user has SUPER_ADMIN role
- Verify JWT token is valid and not expired

#### **"Invalid or expired refresh token"**

- Refresh token may have expired (7 days)
- User may have logged out (tokens revoked)
- Generate new refresh token by logging in again

## 📋 **Best Practices**

### **Security**

1. **Use HTTPS** in production
2. **Rotate JWT secrets** regularly
3. **Implement rate limiting** on login endpoints
4. **Monitor failed login attempts**
5. **Use strong passwords** (enforced by validation)

### **Token Management**

1. **Store tokens securely** (httpOnly cookies recommended)
2. **Implement automatic refresh** before token expires
3. **Revoke tokens** on logout and password change
4. **Handle token expiration** gracefully in frontend

### **Development**

1. **Test authentication** thoroughly
2. **Use environment variables** for secrets
3. **Log authentication events** for monitoring
4. **Implement proper error handling**

## 🎉 **Summary**

The admin authentication system provides:

- ✅ **Secure JWT-based authentication**
- ✅ **Role-based access control**
- ✅ **Password security with bcrypt**
- ✅ **Token refresh mechanism**
- ✅ **Secure logout functionality**
- ✅ **Comprehensive error handling**
- ✅ **Production-ready security features**

The system is fully functional and ready for production use! 🚀
