# Admin Management System

This document describes the comprehensive admin management system that allows super admins to manage other admins in the RFQ platform.

## Overview

The admin management system provides full CRUD operations for admin users, including:

- Creating new admins
- Viewing admin lists with filtering and pagination
- Updating admin information
- Deactivating/restoring admins
- Changing admin passwords
- Viewing admin statistics
- Activity logging

## Features

### 🔐 Role-Based Access Control

- **SUPER_ADMIN**: Can manage all admins (create, read, update, delete)
- **ADMIN**: Can view admin statistics only

### 📊 Admin Management Operations

- **Create Admin**: Add new admins with email, password, name, and role
- **List Admins**: View all admins with filtering by role, status, and search
- **View Admin**: Get detailed information about a specific admin
- **Update Admin**: Modify admin information (email, name, role, status)
- **Deactivate Admin**: Soft delete by setting isActive to false
- **Restore Admin**: Reactivate a deactivated admin
- **Change Password**: Update admin password
- **View Statistics**: Get comprehensive admin statistics

## API Endpoints

### Admin Management (Super Admin Only)

#### Create Admin

```http
POST /api/v1/admin/management/admins
Authorization: Bearer <super_admin_token>
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "ADMIN",
  "isActive": true
}
```

#### Get All Admins

```http
GET /api/v1/admin/management/admins?page=1&limit=20&role=ADMIN&isActive=true&search=john
Authorization: Bearer <super_admin_token>
```

#### Get Admin by ID

```http
GET /api/v1/admin/management/admins/:id
Authorization: Bearer <super_admin_token>
```

#### Update Admin

```http
PUT /api/v1/admin/management/admins/:id
Authorization: Bearer <super_admin_token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "ADMIN",
  "isActive": true
}
```

#### Deactivate Admin

```http
DELETE /api/v1/admin/management/admins/:id
Authorization: Bearer <super_admin_token>
```

#### Restore Admin

```http
POST /api/v1/admin/management/admins/:id/restore
Authorization: Bearer <super_admin_token>
```

#### Change Admin Password

```http
POST /api/v1/admin/management/admins/:id/change-password
Authorization: Bearer <super_admin_token>
Content-Type: application/json

{
  "newPassword": "newsecurepassword123"
}
```

#### Get Admin Statistics

```http
GET /api/v1/admin/management/statistics
Authorization: Bearer <admin_token>
```

#### Get Admin Activity Logs

```http
GET /api/v1/admin/management/admins/:id/activity?limit=50
Authorization: Bearer <super_admin_token>
```

## Data Models

### Admin Create Data

```typescript
interface AdminCreateData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: AdminRole; // "ADMIN" | "SUPER_ADMIN"
  isActive?: boolean;
}
```

### Admin Update Data

```typescript
interface AdminUpdateData {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: AdminRole;
  isActive?: boolean;
}
```

### Admin List Filters

```typescript
interface AdminListFilters {
  page?: number;
  limit?: number;
  role?: AdminRole;
  isActive?: boolean;
  search?: string;
}
```

### Admin Response

```typescript
interface AdminResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

## Security Features

### Password Security

- Passwords are hashed using bcrypt with salt rounds of 12
- Minimum password length of 6 characters
- Passwords are never returned in API responses

### Access Control

- All admin management endpoints require super admin role
- JWT token validation for all requests
- Role-based authorization checks

### Data Validation

- Email format validation
- Required field validation
- Role validation (ADMIN or SUPER_ADMIN only)
- Name length validation (minimum 2 characters)

## Error Handling

### Common Error Responses

#### 400 Bad Request

```json
{
  "success": false,
  "error": "Email, password, firstName, lastName, and role are required",
  "code": "VALIDATION_ERROR"
}
```

#### 401 Unauthorized

```json
{
  "success": false,
  "error": "Access token required",
  "code": "UNAUTHORIZED"
}
```

#### 403 Forbidden

```json
{
  "success": false,
  "error": "Super admin access required",
  "code": "FORBIDDEN"
}
```

#### 404 Not Found

```json
{
  "success": false,
  "error": "Admin not found",
  "code": "NOT_FOUND"
}
```

## Usage Examples

### Creating a New Admin

```typescript
const adminData = {
  email: "newadmin@company.com",
  password: "SecurePass123!",
  firstName: "Alice",
  lastName: "Johnson",
  role: "ADMIN" as AdminRole,
  isActive: true,
};

const newAdmin = await adminManagementService.createAdmin(adminData);
```

### Getting Admins with Filters

```typescript
const filters = {
  page: 1,
  limit: 20,
  role: "ADMIN" as AdminRole,
  isActive: true,
  search: "john",
};

const admins = await adminManagementService.getAdmins(filters);
```

### Updating an Admin

```typescript
const updateData = {
  firstName: "Updated",
  lastName: "Name",
  role: "SUPER_ADMIN" as AdminRole,
};

const updatedAdmin = await adminManagementService.updateAdmin(
  adminId,
  updateData
);
```

## Testing

### Run Admin Management Tests

```bash
npx ts-node src/admin/scripts/testAdminManagement.ts
```

### Manual Testing with cURL

#### Create Admin

```bash
curl -X POST http://localhost:3000/api/v1/admin/management/admins \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "Admin",
    "role": "ADMIN"
  }'
```

#### Get All Admins

```bash
curl -X GET "http://localhost:3000/api/v1/admin/management/admins?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN"
```

## Database Schema

### Admin Table

```sql
CREATE TABLE "Admin" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "role" "AdminRole" NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "lastLoginAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
```

## Best Practices

### Security

1. Always use strong passwords (minimum 8 characters with mixed case, numbers, and symbols)
2. Regularly rotate admin passwords
3. Monitor admin activity logs
4. Use HTTPS in production
5. Implement rate limiting on admin endpoints

### Data Management

1. Use soft deletes (isActive = false) instead of hard deletes
2. Maintain audit trails for admin changes
3. Regular backup of admin data
4. Implement data retention policies

### Performance

1. Use pagination for large admin lists
2. Index frequently queried fields (email, role, isActive)
3. Cache admin statistics for better performance
4. Monitor database query performance

## Troubleshooting

### Common Issues

#### "Admin with this email already exists"

- Check if an admin with the same email already exists
- Use a different email address

#### "Super admin access required"

- Ensure the authenticated user has SUPER_ADMIN role
- Check the JWT token is valid and not expired

#### "Cannot delete super admin"

- Super admins cannot be deleted for security reasons
- Deactivate instead of deleting

#### "Invalid admin role"

- Use only "ADMIN" or "SUPER_ADMIN" as valid roles
- Check the role value in the request

## Support

For issues or questions regarding the admin management system:

1. Check the error logs for detailed error messages
2. Verify the request format and required fields
3. Ensure proper authentication and authorization
4. Contact the development team for assistance
