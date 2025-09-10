# RFQ Company APIs - Postman Collection

This directory contains Postman collection and environment files for testing all RFQ Platform Company APIs.

## 📁 **Files**

- **`RFQ_Company_APIs.postman_collection.json`** - Complete collection of all company APIs
- **`RFQ_Company_Environment.postman_environment.json`** - Environment variables for testing
- **`COMPANY_README.md`** - This documentation file

## 🚀 **Quick Start**

### **1. Import Collection and Environment**

1. Open Postman
2. Click **Import** button
3. Select both files:
   - `RFQ_Company_APIs.postman_collection.json`
   - `RFQ_Company_Environment.postman_environment.json`
4. Click **Import**

### **2. Set Up Environment**

1. In Postman, go to **Environments** tab
2. Select **RFQ Company Environment**
3. Verify the following variables are set:
   - `base_url`: `http://localhost:3000/api/v1/company`
   - `company_user_email`: `testuser@shippingcompany.com`
   - `company_user_password`: `TestPassword123!`

### **3. Start Testing**

1. Make sure your server is running: `npm run dev`
2. Create a test company and user (or use existing ones)
3. In Postman, go to **RFQ Company APIs** collection
4. Start with **Authentication > Company Login**
5. The collection will automatically set tokens for subsequent requests

## 📋 **Collection Structure**

### **🔐 Authentication**

- **Company Login** - Login and get access/refresh tokens
- **Get Profile** - Get current user profile
- **Change Password** - Change user password
- **Refresh Token** - Refresh access token
- **Company Logout** - Logout and revoke tokens

**Token Expiration:**

- Access tokens expire in **12 hours**
- Refresh tokens expire in **7 days**
- Use refresh token to get new access token before expiration

### **👥 User Management**

- **List Users** - Get all company users
- **Create User** - Create new user account
- **Get User by ID** - Get specific user details
- **Update User** - Update user information
- **Update User Status** - Activate/deactivate user
- **Update User Role** - Change user role (Admin, Manager, Employee)
- **Reset User Password** - Reset user's password
- **Get User Roles** - Get available user roles
- **Get User Permissions** - Get user permissions
- **Delete User** - Delete user account

### **🚢 Shipping Line Management**

- **List Shipping Lines** - Get all shipping lines
- **Create Shipping Line** - Create new shipping line
- **Get Shipping Line by ID** - Get specific shipping line details
- **Update Shipping Line** - Update shipping line information
- **Update Shipping Line Status** - Activate/deactivate shipping line
- **Archive Shipping Line** - Archive shipping line
- **Restore Shipping Line** - Restore archived shipping line
- **Get Trade Lanes** - Get all trade lanes
- **Get Services** - Get all services
- **Get Tags** - Get all tags
- **Delete Shipping Line** - Delete shipping line

### **📞 Contact Management**

- **List Contacts** - Get all contacts
- **Create Contact** - Create new contact
- **Get Contact by ID** - Get specific contact details
- **Update Contact** - Update contact information
- **Set Primary Contact** - Set as primary contact for shipping line
- **Update Do Not Contact** - Mark/unmark as do not contact
- **Get Performance Stats** - Get contact performance statistics
- **Get Departments** - Get all departments
- **Get Tags** - Get all tags
- **Get Seniority Levels** - Get all seniority levels
- **Get Specializations** - Get all specializations
- **Update Contact Status** - Activate/deactivate contact
- **Archive Contact** - Archive contact
- **Restore Contact** - Restore archived contact
- **Delete Contact** - Delete contact

### **📋 RFQ Management**

- **List RFQs** - Get all RFQs
- **Create RFQ** - Create new RFQ
- **Get RFQ by ID** - Get specific RFQ details
- **Update RFQ** - Update RFQ information
- **Update RFQ Status** - Change RFQ status (Draft, Sent, Closed, Awarded)
- **Send RFQ** - Send RFQ to contacts
- **Close RFQ** - Close RFQ
- **Award RFQ** - Award RFQ to winning quote
- **Get RFQ Recipients** - Get RFQ recipients
- **Get RFQ Quotes** - Get RFQ quotes
- **Get RFQ Analytics** - Get RFQ analytics
- **Get Trade Lanes** - Get all trade lanes
- **Get Tags** - Get all tags
- **Duplicate RFQ** - Duplicate existing RFQ
- **Delete RFQ** - Delete RFQ

### **📄 Template Management**

- **List Templates** - Get all RFQ templates
- **Create Template** - Create new template
- **Get Template by ID** - Get specific template details
- **Update Template** - Update template information
- **Use Template** - Use template to create RFQ data
- **Create Template from RFQ** - Create template from existing RFQ
- **Set Default Template** - Set as default template
- **Duplicate Template** - Duplicate existing template
- **Get Template Categories** - Get all template categories
- **Get Template Languages** - Get supported languages
- **Get Template Tags** - Get all template tags
- **Get Template Trade Lanes** - Get all template trade lanes
- **Get Template Analytics** - Get template analytics
- **Update Template Status** - Activate/deactivate template
- **Delete Template** - Delete template

### **📊 Analytics**

- **Get Company Analytics** - Get overall company analytics
- **Get RFQ Analytics** - Get RFQ-specific analytics
- **Get Quote Analytics** - Get quote analytics
- **Get Contact Analytics** - Get contact analytics
- **Get Email Analytics** - Get email analytics

### **🏢 Company Profile**

- **Get Company Profile** - Get company profile information
- **Update Company Profile** - Update company profile

## 🔧 **Environment Variables**

The collection uses the following environment variables:

| Variable                | Description                  | Example Value                          |
| ----------------------- | ---------------------------- | -------------------------------------- |
| `base_url`              | Base URL for company APIs    | `http://localhost:3000/api/v1/company` |
| `company_access_token`  | JWT access token (auto-set)  | `eyJhbGciOiJIUzI1NiIs...`              |
| `company_refresh_token` | JWT refresh token (auto-set) | `a1b2c3d4e5f6g7h8...`                  |
| `company_id`            | Company ID (auto-set)        | `company-uuid`                         |
| `user_id`               | User ID (auto-set)           | `user-uuid`                            |
| `shipping_line_id`      | Shipping Line ID (auto-set)  | `shipping-line-uuid`                   |
| `contact_id`            | Contact ID (auto-set)        | `contact-uuid`                         |
| `rfq_id`                | RFQ ID (auto-set)            | `rfq-uuid`                             |
| `template_id`           | Template ID (auto-set)       | `template-uuid`                        |
| `quote_id`              | Quote ID (auto-set)          | `quote-uuid`                           |
| `company_user_email`    | Company user email           | `testuser@shippingcompany.com`         |
| `company_user_password` | Company user password        | `TestPassword123!`                     |

## 🎯 **Testing Workflow**

### **1. Authentication Flow**

1. Run **Company Login** to get tokens
2. Tokens are automatically set in environment variables
3. All subsequent requests use the access token

### **2. Basic Testing Flow**

1. **Login** → Get tokens
2. **Get Profile** → Verify authentication
3. **Create Shipping Line** → Test shipping line management
4. **Create Contact** → Test contact management
5. **Create RFQ** → Test RFQ management
6. **Create Template** → Test template management

### **3. Advanced Testing Flow**

1. **User Management** → Test user CRUD operations
2. **Analytics** → Test various analytics endpoints
3. **Template Management** → Test template operations
4. **RFQ Operations** → Test RFQ lifecycle

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
  "email": "{{company_user_email}}",
  "password": "{{company_user_password}}"
}
```

### **Create User Request**

```json
POST {{base_url}}/users
{
  "email": "newuser@company.com",
  "password": "Password123!",
  "firstName": "New",
  "lastName": "User",
  "role": "EMPLOYEE"
}
```

### **Create Shipping Line Request**

```json
POST {{base_url}}/shipping-lines
{
  "name": "Test Shipping Line",
  "code": "TSL",
  "scacCode": "TSL",
  "website": "https://testshipping.com",
  "headquartersLocation": "Test City",
  "headquartersCountry": "USA",
  "description": "Test shipping line",
  "tags": ["test", "shipping"],
  "tradeLanes": ["Asia-Europe"],
  "services": ["Container", "Breakbulk"],
  "specialization": "Container Shipping",
  "reliability": 4,
  "serviceQuality": 4
}
```

### **Create Contact Request**

```json
POST {{base_url}}/contacts
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@shipping.com",
  "phone": "+1234567890",
  "jobTitle": "Sales Manager",
  "department": "Sales",
  "shippingLineId": "{{shipping_line_id}}",
  "tags": ["primary", "sales"],
  "notes": "Test contact",
  "seniority": "SENIOR",
  "specialization": "Container Shipping",
  "quoteQuality": 4,
  "reliability": 4,
  "isPrimary": true
}
```

### **Create RFQ Request**

```json
POST {{base_url}}/rfqs
{
  "title": "Test RFQ for Container Shipping",
  "description": "Test RFQ description",
  "originPort": "Shanghai",
  "destinationPort": "Los Angeles",
  "commodity": "Electronics",
  "containerType": "40GP",
  "containerQuantity": 1,
  "cargoWeight": 20000,
  "cargoVolume": 67,
  "incoterm": "FOB",
  "cargoReadyDate": "2024-02-01",
  "quoteDeadline": "2024-01-25",
  "shipmentUrgency": "NORMAL",
  "specialRequirements": "None",
  "requiredServices": ["Container"],
  "preferredCarriers": ["Test Shipping Line"],
  "tradeLane": "Asia-North America",
  "estimatedValue": 50000,
  "currency": "USD",
  "notes": "Test RFQ",
  "tags": ["test", "container"],
  "priority": "MEDIUM"
}
```

### **Create Template Request**

```json
POST {{base_url}}/templates
{
  "name": "Test RFQ Template",
  "description": "Test template for container shipping",
  "subjectTemplate": "RFQ Request - {{commodity}} from {{originPort}} to {{destinationPort}}",
  "bodyTemplate": "Please find attached RFQ details for {{commodity}} shipping.",
  "originPort": "Shanghai",
  "destinationPort": "Los Angeles",
  "commodity": "Electronics",
  "containerType": "40GP",
  "containerQuantity": 1,
  "cargoWeight": 20000,
  "cargoVolume": 67,
  "incoterm": "FOB",
  "specialRequirements": "None",
  "requiredServices": ["Container"],
  "category": "Container Shipping",
  "tradeLane": "Asia-North America",
  "language": "en",
  "tags": ["test", "container"],
  "isPublic": false
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

- `company_access_token` - Set after login/refresh
- `company_refresh_token` - Set after login/refresh
- `company_id` - Set after login
- `user_id` - Set after login
- `shipping_line_id` - Set after creating shipping line
- `contact_id` - Set after creating contact
- `rfq_id` - Set after creating RFQ
- `template_id` - Set after creating template
- `quote_id` - Set after creating quote

## 📊 **Response Examples**

### **Successful Login Response**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "testuser@shippingcompany.com",
      "firstName": "Test",
      "lastName": "User",
      "role": "ADMIN",
      "userType": "COMPANY_USER",
      "companyId": "company-uuid",
      "companyName": "Test Shipping Company"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "a1b2c3d4e5f6g7h8..."
    }
  },
  "message": "Company user login successful"
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

- ✅ **Complete API Coverage** - All company endpoints included
- ✅ **Auto-Authentication** - Tokens automatically managed
- ✅ **Environment Variables** - Easy configuration
- ✅ **Request Examples** - Ready-to-use request bodies
- ✅ **Error Handling** - Proper error responses
- ✅ **Auto-Update Variables** - IDs automatically set
- ✅ **Organized Structure** - Logical grouping of endpoints
- ✅ **Documentation** - Comprehensive request descriptions

## 🚀 **Ready to Use!**

The collection is production-ready and includes:

- **100+ API endpoints** covering all company functionality
- **Automatic token management** for seamless testing
- **Comprehensive error handling** for robust testing
- **Environment variables** for easy configuration
- **Request examples** for quick testing
- **Auto-updating variables** for workflow efficiency

**Import the collection and start testing immediately!** 🎯
