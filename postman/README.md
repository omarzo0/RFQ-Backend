# RFQ Admin APIs - Postman Collection

This directory contains Postman collection and environment files for testing all RFQ Platform Admin APIs.

## 📁 **Files**

- **`RFQ_Admin_APIs.postman_collection.json`** - Complete collection of all admin APIs
- **`RFQ_Admin_Environment.postman_environment.json`** - Environment variables for testing
- **`README.md`** - This documentation file

## 🚀 **Quick Start**

### **1. Import Collection and Environment**

1. Open Postman
2. Click **Import** button
3. Select both files:
   - `RFQ_Admin_APIs.postman_collection.json`
   - `RFQ_Admin_Environment.postman_environment.json`
4. Click **Import**

### **2. Set Up Environment**

1. In Postman, go to **Environments** tab
2. Select **RFQ Admin Environment**
3. Verify the following variables are set:
   - `base_url`: `http://localhost:3000/api/v1/admin`
   - `super_admin_email`: `superadmin@rfqplatform.com`
   - `super_admin_password`: `admin123`

### **3. Start Testing**

1. Make sure your server is running: `npm run dev`
2. Create super admin: `npx ts-node src/admin/scripts/createSuperAdmin.ts`
3. In Postman, go to **RFQ Admin APIs** collection
4. Start with **Authentication > Admin Login**
5. The collection will automatically set tokens for subsequent requests

## 📋 **Collection Structure**

### **🔐 Authentication**

- **Admin Login** - Login and get access/refresh tokens
- **Get Admin Profile** - Get current admin profile
- **Change Password** - Change admin password
- **Refresh Token** - Refresh access token
- **Admin Logout** - Logout and revoke tokens

### **📊 Dashboard**

- **Comprehensive Dashboard** - Complete dashboard overview
- **Admin Management Overview** - Admin management data
- **Company Management Overview** - Company management data
- **Ticket Management Overview** - Ticket management data
- **System Features Overview** - System features data
- **Analytics Overview** - Analytics data
- **Subscription Overview** - Subscription data
- **Recent Activity** - Recent activity feed
- **System Health** - System health metrics

### **👥 Admin Management** (Super Admin Only)

- **Create Admin** - Create new admin account
- **List Admins** - Get list of all admins
- **Get Admin by ID** - Get specific admin details
- **Update Admin** - Update admin information
- **Deactivate Admin** - Deactivate admin account
- **Restore Admin** - Restore deactivated admin
- **Change Admin Password** - Change admin's password
- **Admin Statistics** - Get admin statistics

### **🏢 Company Management**

- **Create Company** - Create new company account
- **List Companies** - Get list of all companies
- **Get Company by ID** - Get specific company details
- **Update Company** - Update company information
- **Deactivate Company** - Deactivate company account
- **Restore Company** - Restore deactivated company
- **Get Company Details** - Get detailed company information

### **📈 Analytics**

- **Company Growth Data** - Company growth analytics
- **Revenue Data** - Revenue analytics
- **User Activity Data** - User activity analytics
- **Email Performance Data** - Email performance analytics
- **RFQ Performance Data** - RFQ performance analytics
- **Quote Performance Data** - Quote performance analytics
- **Top Performing Companies** - Top companies analytics
- **System Health Metrics** - System health analytics

### **💳 Subscription Management**

- **List Subscriptions** - Get all subscriptions
- **Get Subscription by Company** - Get company subscription
- **Update Subscription** - Update subscription details
- **Suspend Subscription** - Suspend subscription
- **Reactivate Subscription** - Reactivate subscription
- **Cancel Subscription** - Cancel subscription
- **Extend Trial** - Extend trial period
- **Subscription Analytics** - Subscription analytics
- **Expiring Trials** - Get expiring trials
- **Subscription Usage** - Get subscription usage

### **🎫 Ticket System**

- **Create Ticket** - Create support ticket
- **List Tickets** - Get all tickets
- **Get Ticket by ID** - Get specific ticket
- **Update Ticket** - Update ticket details
- **Assign Ticket** - Assign ticket to admin
- **Close Ticket** - Close ticket
- **Ticket Statistics** - Get ticket statistics
- **My Tickets** - Get my assigned tickets
- **Recent Tickets** - Get recent tickets

### **⚙️ System Features** (Super Admin Only)

- **Create Feature** - Create new system feature
- **List Features** - Get all system features
- **Get Feature by ID** - Get specific feature
- **Update Feature** - Update feature details
- **Delete Feature** - Delete feature
- **Features by Category** - Get features by category
- **Feature Statistics** - Get feature statistics
- **Initialize Default Features** - Initialize default features
- **Company Dashboard Features** - Get company's enabled features
- **Toggle Company Feature** - Enable/disable feature for company

## 🔧 **Environment Variables**

The collection uses the following environment variables:

| Variable               | Description                  | Example Value                        |
| ---------------------- | ---------------------------- | ------------------------------------ |
| `base_url`             | Base URL for admin APIs      | `http://localhost:3000/api/v1/admin` |
| `admin_access_token`   | JWT access token (auto-set)  | `eyJhbGciOiJIUzI1NiIs...`            |
| `admin_refresh_token`  | JWT refresh token (auto-set) | `a1b2c3d4e5f6g7h8...`                |
| `company_id`           | Company ID (auto-set)        | `company-uuid`                       |
| `admin_id`             | Admin ID (auto-set)          | `admin-uuid`                         |
| `ticket_id`            | Ticket ID (auto-set)         | `ticket-uuid`                        |
| `feature_id`           | Feature ID (auto-set)        | `feature-uuid`                       |
| `super_admin_email`    | Super admin email            | `superadmin@rfqplatform.com`         |
| `super_admin_password` | Super admin password         | `admin123`                           |

## 🎯 **Testing Workflow**

### **1. Authentication Flow**

1. Run **Admin Login** to get tokens
2. Tokens are automatically set in environment variables
3. All subsequent requests use the access token

### **2. Basic Testing Flow**

1. **Login** → Get tokens
2. **Get Profile** → Verify authentication
3. **Comprehensive Dashboard** → Test protected route
4. **Create Company** → Test company management
5. **Create Ticket** → Test ticket system
6. **Create Feature** → Test system features (Super Admin only)

### **3. Advanced Testing Flow**

1. **Admin Management** → Test admin CRUD operations
2. **Analytics** → Test various analytics endpoints
3. **Subscription Management** → Test subscription operations
4. **System Features** → Test feature management

## 🔐 **Authentication**

The collection uses **Bearer Token** authentication:

1. **Login** request automatically sets tokens
2. **Refresh Token** request updates tokens
3. All protected requests use the access token
4. **Logout** request revokes all tokens

## 📝 **Request Examples**

### **Login Request**

```json
POST {{base_url}}/auth/login
{
  "email": "{{super_admin_email}}",
  "password": "{{super_admin_password}}"
}
```

### **Create Company Request**

```json
POST {{base_url}}/companies
{
  "name": "Shipping Company Ltd",
  "email": "contact@shippingcompany.com",
  "phone": "+1234567890",
  "address": "123 Business St",
  "city": "New York",
  "country": "USA",
  "subscriptionPlan": "professional",
  "subscriptionStatus": "ACTIVE"
}
```

### **Create Ticket Request**

```json
POST {{base_url}}/tickets
{
  "title": "Email delivery issues",
  "description": "Users reporting emails not being delivered",
  "priority": "HIGH",
  "category": "TECHNICAL",
  "companyId": "{{company_id}}"
}
```

## 🚨 **Error Handling**

The collection includes proper error handling:

- **401 Unauthorized** - Invalid or expired token
- **403 Forbidden** - Insufficient permissions
- **400 Bad Request** - Invalid request data
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

## 🔄 **Auto-Update Variables**

The collection automatically updates these variables:

- `admin_access_token` - Set after login/refresh
- `admin_refresh_token` - Set after login/refresh
- `admin_id` - Set after login
- `company_id` - Set after creating company
- `ticket_id` - Set after creating ticket
- `feature_id` - Set after creating feature

## 📊 **Response Examples**

### **Successful Login Response**

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
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "a1b2c3d4e5f6g7h8..."
    }
  },
  "message": "Admin login successful"
}
```

### **Error Response**

```json
{
  "success": false,
  "error": "Invalid email or password",
  "code": "UNAUTHORIZED"
}
```

## 🎉 **Benefits**

Using this Postman collection provides:

- ✅ **Complete API Coverage** - All admin endpoints included
- ✅ **Auto-Authentication** - Tokens automatically managed
- ✅ **Environment Variables** - Easy configuration
- ✅ **Request Examples** - Ready-to-use request bodies
- ✅ **Error Handling** - Proper error responses
- ✅ **Auto-Update Variables** - IDs automatically set
- ✅ **Organized Structure** - Logical grouping of endpoints
- ✅ **Documentation** - Comprehensive request descriptions

## 🚀 **Ready to Use!**

The collection is production-ready and includes:

- **100+ API endpoints** covering all admin functionality
- **Automatic token management** for seamless testing
- **Comprehensive error handling** for robust testing
- **Environment variables** for easy configuration
- **Request examples** for quick testing
- **Auto-updating variables** for workflow efficiency

**Import the collection and start testing immediately!** 🎯
