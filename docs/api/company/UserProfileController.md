# User Profile Management API

## Overview
These endpoints allow authenticated company users to view and update their own profile information. Users can update their name, email, and password without requiring admin permissions.

## Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

---

## Endpoints

### 1. Get My Profile

Retrieve the current authenticated user's profile information.

**Endpoint:** `GET /api/v1/company/users/me`

**Authentication:** Required

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "MANAGER",
    "isActive": true,
    "lastLoginAt": "2025-11-15T10:30:00.000Z",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-11-15T09:00:00.000Z",
    "company": {
      "name": "Acme Corporation",
      "subscriptionPlan": "Professional"
    }
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "message": "Unauthorized",
  "error": "Invalid or expired token"
}
```

---

### 2. Update My Profile

Update the current authenticated user's profile information. Users can update their name, email, and password.

**Endpoint:** `PUT /api/v1/company/users/me`

**Authentication:** Required

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body (Update Name):**
```json
{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Request Body (Update Email):**
```json
{
  "email": "newemail@example.com"
}
```

**Request Body (Change Password):**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePassword456!"
}
```

**Request Body (Update Multiple Fields):**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid",
    "email": "jane.smith@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "MANAGER",
    "isActive": true,
    "lastLoginAt": "2025-11-15T10:30:00.000Z",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-11-15T10:45:00.000Z",
    "company": {
      "name": "Acme Corporation",
      "subscriptionPlan": "Professional"
    }
  }
}
```

**Response (Error - 400 - Email Already Exists):**
```json
{
  "success": false,
  "message": "Email already exists",
  "error": "Validation error"
}
```

**Response (Error - 400 - Invalid Current Password):**
```json
{
  "success": false,
  "message": "Current password is incorrect",
  "error": "Validation error"
}
```

**Response (Error - 400 - Weak New Password):**
```json
{
  "success": false,
  "message": "Invalid new password",
  "error": "Validation error",
  "details": [
    "Password must be at least 8 characters long",
    "Password must contain at least one uppercase letter",
    "Password must contain at least one number"
  ]
}
```

---

## Field Restrictions

### Updatable Fields
- `firstName` - User's first name
- `lastName` - User's last name
- `email` - User's email address (must be unique)
- `password` - User's password (requires current password verification)

### Protected Fields (Cannot be Updated via Profile)
- `role` - User role (ADMIN, MANAGER, EMPLOYEE)
- `isActive` - Account status
- `companyId` - Company association
- `id` - User ID
- `createdAt` - Creation timestamp
- `lastLoginAt` - Last login timestamp

**Note:** Role and status can only be changed by administrators via the `/api/v1/company/users/:id/role` and `/api/v1/company/users/:id/status` endpoints.

---

## Password Requirements

When changing password, the new password must meet the following criteria:
- Minimum 8 characters long
- Contains at least one uppercase letter (A-Z)
- Contains at least one lowercase letter (a-z)
- Contains at least one number (0-9)
- Contains at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)

---

## Email Validation

When updating email:
- Email must be unique across all users in the system
- Email format must be valid
- Email will be automatically converted to lowercase

---

## Security Features

1. **Authentication Required**: All endpoints require valid JWT token
2. **Tenant Isolation**: Users can only access their own profile
3. **Password Verification**: Changing password requires current password
4. **Password Strength**: New passwords must meet security requirements
5. **Email Uniqueness**: Email addresses must be unique
6. **Protected Fields**: Role and status cannot be self-modified
7. **Audit Trail**: All updates are timestamped in `updatedAt` field

---

## Usage Examples

### cURL Example - Get Profile
```bash
curl -X GET http://localhost:3000/api/v1/company/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### cURL Example - Update Name
```bash
curl -X PUT http://localhost:3000/api/v1/company/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith"
  }'
```

### cURL Example - Change Password
```bash
curl -X PUT http://localhost:3000/api/v1/company/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "OldPassword123!",
    "newPassword": "NewSecurePassword456!"
  }'
```

### JavaScript Example - Get Profile
```javascript
const response = await fetch('http://localhost:3000/api/v1/company/users/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

const result = await response.json();
console.log('Profile:', result.data);
```

### JavaScript Example - Update Profile
```javascript
const response = await fetch('http://localhost:3000/api/v1/company/users/me', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com'
  })
});

const result = await response.json();
console.log('Updated Profile:', result.data);
```

---

## Testing

A test script is provided to help you test these endpoints interactively:

```bash
node test-user-profile.js
```

The test script will:
1. Prompt for your access token
2. Fetch and display your current profile
3. Allow you to update various profile fields
4. Verify the changes by fetching the profile again

---

## Integration with Frontend

### React Example - Profile Component

```javascript
import { useState, useEffect } from 'react';

function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const response = await fetch('/api/v1/company/users/me', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const result = await response.json();
    if (result.success) {
      setProfile(result.data);
      setFormData({
        firstName: result.data.firstName,
        lastName: result.data.lastName,
        email: result.data.email
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/v1/company/users/me', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    const result = await response.json();
    if (result.success) {
      alert('Profile updated successfully!');
      fetchProfile();
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  return (
    <div>
      <h2>My Profile</h2>
      {profile && (
        <form onSubmit={handleUpdate}>
          <div>
            <label>First Name:</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            />
          </div>
          <div>
            <label>Last Name:</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <button type="submit">Update Profile</button>
        </form>
      )}
    </div>
  );
}
```

---

## Related Endpoints

For admin operations on other users, see:
- `GET /api/v1/company/users` - List all users (admin)
- `GET /api/v1/company/users/:id` - Get specific user (admin)
- `PUT /api/v1/company/users/:id` - Update any user (admin)
- `PUT /api/v1/company/users/:id/role` - Update user role (admin)
- `PUT /api/v1/company/users/:id/status` - Update user status (admin)
- `POST /api/v1/company/users/:id/reset-password` - Reset user password (admin)

---

## Changelog

### Version 1.0.0 (November 15, 2025)
- Initial release of user profile management endpoints
- Added GET /api/v1/company/users/me
- Added PUT /api/v1/company/users/me
- Support for updating name, email, and password
- Email uniqueness validation
- Password strength validation
- Current password verification for password changes
