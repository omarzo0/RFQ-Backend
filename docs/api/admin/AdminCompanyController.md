# Admin Company Controller

## Overview

Handles company management operations for admin users including company CRUD, company user management, and dashboard statistics.

**Controller:** `AdminCompanyController`
**Route File:** `adminCompany.ts` (`/api/v1/admin/companies/*`)

All routes require admin authentication.

---

## Dashboard

---

### 1. Get Dashboard Stats

**GET** `/api/v1/admin/companies/dashboard/stats`

**Description:** Get admin dashboard statistics (total companies, users, RFQs, quotes, and recent activity)

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "totalCompanies": 150,
    "activeCompanies": 140,
    "totalUsers": 500,
    "totalRFQs": 2500,
    "totalQuotes": 5000,
    "recentActivity": [
      {
        "id": "activity_id",
        "type": "company_created",
        "description": "New company 'Tech Corp' registered",
        "timestamp": "2024-01-01T10:30:00.000Z",
        "companyName": "Tech Corp"
      }
    ]
  }
}
```

**Status Codes:** `200` Success · `401` Unauthorized · `500` Internal Server Error

---

## Company CRUD Operations

---

### 2. Create Company

**POST** `/api/v1/admin/companies`

**Description:** Create a new company with trial subscription

**Authorization:** Requires `admin` or `super_admin` role

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Company Name",
  "email": "company@example.com",
  "domain": "company.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "country": "US",
  "timezone": "America/New_York",
  "subscriptionPlan": "trial",
  "subscriptionStatus": "ACTIVE",
  "trialEndsAt": "2024-02-01T00:00:00.000Z",
  "emailFooter": "Best regards, Company Name",
  "defaultFollowUpDays": 3,
  "autoFollowUpEnabled": true
}
```

**Payload Fields:**

| Field                | Type     | Required | Default    | Notes                                              |
| -------------------- | -------- | -------- | ---------- | -------------------------------------------------- |
| `name`               | string   | **Yes**  | —          | Company name                                       |
| `email`              | string   | **Yes**  | —          | Must be unique, auto-lowercased                    |
| `domain`             | string   | No       | `null`     |                                                    |
| `phone`              | string   | No       | `null`     |                                                    |
| `address`            | string   | No       | `null`     |                                                    |
| `city`               | string   | No       | `null`     |                                                    |
| `country`            | string   | No       | `null`     |                                                    |
| `timezone`           | string   | No       | `"UTC"`    |                                                    |
| `subscriptionPlan`   | string   | No       | `"trial"` |                                                    |
| `subscriptionStatus` | string   | No       | `"ACTIVE"`| `ACTIVE`, `INACTIVE`, `SUSPENDED`, `CANCELED`      |
| `trialEndsAt`        | ISO date | No       | +30 days   | Auto-set to 30 days from now if not provided       |
| `emailFooter`        | string   | No       | `null`     |                                                    |
| `defaultFollowUpDays`| number   | No       | `3`        |                                                    |
| `autoFollowUpEnabled`| boolean  | No       | `true`     |                                                    |

**Response:**

```json
{
  "success": true,
  "message": "Company created successfully",
  "data": {
    "id": "company_id",
    "name": "Company Name",
    "email": "company@example.com",
    "domain": "company.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "country": "US",
    "timezone": "America/New_York",
    "subscriptionPlan": "trial",
    "subscriptionStatus": "ACTIVE",
    "trialEndsAt": "2024-02-01T00:00:00.000Z",
    "emailFooter": "Best regards, Company Name",
    "defaultFollowUpDays": 3,
    "autoFollowUpEnabled": true,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:** `201` Created · `400` Invalid input / missing required fields · `401` Unauthorized · `403` Forbidden · `409` Company already exists · `500` Internal Server Error

---

### 3. Get All Companies

**GET** `/api/v1/admin/companies`

**Description:** Get paginated list of all companies

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

| Parameter | Type   | Default | Description                        |
| --------- | ------ | ------- | ---------------------------------- |
| `page`    | number | 1       | Page number                        |
| `limit`   | number | 10      | Items per page                     |
| `search`  | string | —       | Search term for name or email      |
| `status`  | string | —       | Filter by subscription status      |

**Response:**

```json
{
  "success": true,
  "message": "Companies retrieved successfully",
  "data": {
    "companies": [
      {
        "id": "company_id",
        "name": "Company Name",
        "email": "company@example.com",
        "subscriptionPlan": "trial",
        "subscriptionStatus": "ACTIVE",
        "trialEndsAt": "2024-02-01T00:00:00.000Z",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

**Status Codes:** `200` Success · `401` Unauthorized · `500` Internal Server Error

---

### 4. Get Company by ID

**GET** `/api/v1/admin/companies/:companyId`

**Description:** Get detailed information about a specific company

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**

| Parameter   | Type   | Description |
| ----------- | ------ | ----------- |
| `companyId` | string | Company ID  |

**Response:**

```json
{
  "success": true,
  "message": "Company retrieved successfully",
  "data": {
    "id": "company_id",
    "name": "Company Name",
    "email": "company@example.com",
    "domain": "company.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "country": "US",
    "timezone": "America/New_York",
    "subscriptionPlan": "trial",
    "subscriptionStatus": "ACTIVE",
    "trialEndsAt": "2024-02-01T00:00:00.000Z",
    "emailFooter": "Best regards, Company Name",
    "defaultFollowUpDays": 3,
    "autoFollowUpEnabled": true,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "users": [
      {
        "id": "user_id",
        "email": "user@company.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "admin",
        "isActive": true
      }
    ]
  }
}
```

**Status Codes:** `200` Success · `400` Missing Company ID · `401` Unauthorized · `404` Company not found · `500` Internal Server Error

---

### 5. Update Company

**PUT** `/api/v1/admin/companies/:companyId`

**Description:** Update company information

**Authorization:** Requires `admin` or `super_admin` role

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

| Parameter   | Type   | Description |
| ----------- | ------ | ----------- |
| `companyId` | string | Company ID  |

**Request Body (all fields optional — send only what you want to change):**

```json
{
  "name": "Updated Company Name",
  "email": "updated@company.com",
  "domain": "updated-company.com",
  "phone": "+1234567890",
  "address": "456 New St",
  "city": "London",
  "country": "UK",
  "timezone": "Europe/London",
  "isActive": true
}
```

**Accepted Fields:**

| Field                | Type     | Notes                                              |
| -------------------- | -------- | -------------------------------------------------- |
| `name`               | string   |                                                    |
| `email`              | string   | Must be unique, auto-lowercased                    |
| `domain`             | string   |                                                    |
| `phone`              | string   |                                                    |
| `address`            | string   |                                                    |
| `city`               | string   |                                                    |
| `country`            | string   |                                                    |
| `timezone`           | string   |                                                    |
| `subscriptionPlan`   | string   |                                                    |
| `subscriptionStatus` | string   | `ACTIVE`, `INACTIVE`, `SUSPENDED`, `CANCELED`      |
| `trialEndsAt`        | ISO date |                                                    |
| `emailFooter`        | string   |                                                    |
| `defaultFollowUpDays`| number   |                                                    |
| `autoFollowUpEnabled`| boolean  |                                                    |
| `isActive`           | boolean  | Toggle company active/inactive                     |

> ⚠️ Any fields not listed above (e.g. `website`, `industry`, `size`, `description`) are **silently ignored** — they do not exist on the Company schema.

**Response:**

```json
{
  "success": true,
  "message": "Company updated successfully",
  "data": {
    "id": "company_id",
    "name": "Updated Company Name",
    "email": "updated@company.com",
    "domain": "updated-company.com",
    "phone": "+1234567890",
    "address": "456 New St",
    "city": "London",
    "country": "UK",
    "timezone": "Europe/London",
    "subscriptionPlan": "trial",
    "subscriptionStatus": "ACTIVE",
    "trialEndsAt": "2024-02-01T00:00:00.000Z",
    "emailFooter": null,
    "defaultFollowUpDays": 3,
    "autoFollowUpEnabled": true,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:** `200` Success · `400` Missing Company ID or invalid input · `401` Unauthorized · `403` Forbidden · `404` Company not found · `500` Internal Server Error

---

### 6. Delete Company

**DELETE** `/api/v1/admin/companies/:companyId`

**Description:** Soft delete a company (deactivate)

**Authorization:** Requires `admin` or `super_admin` role

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**

| Parameter   | Type   | Description |
| ----------- | ------ | ----------- |
| `companyId` | string | Company ID  |

**Response:**

```json
{
  "success": true,
  "message": "Company deleted successfully",
  "data": {
    "id": "company_id",
    "isActive": false,
    "deletedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:** `200` Success · `400` Missing Company ID · `401` Unauthorized · `403` Forbidden · `404` Company not found · `500` Internal Server Error

---

### 7. Restore Company

**POST** `/api/v1/admin/companies/:companyId/restore`

**Description:** Restore a soft-deleted (deactivated) company

**Authorization:** Requires `admin` or `super_admin` role

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**

| Parameter   | Type   | Description |
| ----------- | ------ | ----------- |
| `companyId` | string | Company ID  |

**Response:**

```json
{
  "success": true,
  "message": "Company restored successfully",
  "data": {
    "id": "company_id",
    "name": "Company Name",
    "isActive": true,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:** `200` Success · `400` Missing Company ID · `401` Unauthorized · `403` Forbidden · `404` Company not found · `500` Internal Server Error

---

## Company User Management

---

### 8. Create Company User

**POST** `/api/v1/admin/companies/users`

**Description:** Create a new user for a company

**Authorization:** Requires `admin` or `super_admin` role

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "newuser@company.com",
  "password": "SecurePass123!",
  "companyId": "company-uuid-here",
  "firstName": "John",
  "lastName": "Doe",
  "role": "EMPLOYEE"
}
```

**Validation Rules:**

| Field       | Type   | Required | Rules                                      |
| ----------- | ------ | -------- | ------------------------------------------ |
| `email`     | string | Yes      | Valid email format                          |
| `password`  | string | Yes      | Meets password strength requirements        |
| `companyId` | string | Yes      | Valid UUID                                  |
| `firstName` | string | Yes      | 2–100 characters                            |
| `lastName`  | string | Yes      | 2–100 characters                            |
| `role`      | string | No       | One of: `ADMIN`, `MANAGER`, `EMPLOYEE` (default: `EMPLOYEE`) |

**Response:**

```json
{
  "success": true,
  "message": "Company user created successfully",
  "data": {
    "id": "user_id",
    "email": "newuser@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "EMPLOYEE",
    "companyId": "company-uuid-here",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:** `201` Created · `400` Validation failed · `401` Unauthorized · `403` Forbidden · `409` User already exists · `500` Internal Server Error

---

### 9. Get Company Users

**GET** `/api/v1/admin/companies/:companyId/users`

**Description:** Get paginated list of users for a specific company

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**

| Parameter   | Type   | Description |
| ----------- | ------ | ----------- |
| `companyId` | string | Company ID  |

**Query Parameters:**

| Parameter | Type   | Default | Description    |
| --------- | ------ | ------- | -------------- |
| `page`    | number | 1       | Page number    |
| `limit`   | number | 10      | Items per page |

**Response:**

```json
{
  "success": true,
  "message": "Company users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "user_id",
        "email": "user@company.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "ADMIN",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "lastLogin": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

**Status Codes:** `200` Success · `400` Missing Company ID · `401` Unauthorized · `404` Company not found · `500` Internal Server Error

---

### 10. Update Company User

**PUT** `/api/v1/admin/companies/users/:userId`

**Description:** Update a company user's information

**Authorization:** Requires `admin` or `super_admin` role

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `userId`  | string | User ID     |

**Request Body:**

```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "role": "MANAGER",
  "isActive": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Company user updated successfully",
  "data": {
    "id": "user_id",
    "email": "user@company.com",
    "firstName": "Updated",
    "lastName": "Name",
    "role": "MANAGER",
    "isActive": true,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:** `200` Success · `400` Missing User ID · `401` Unauthorized · `403` Forbidden · `404` User not found · `500` Internal Server Error

---

### 11. Delete Company User

**DELETE** `/api/v1/admin/companies/users/:userId`

**Description:** Delete a company user

**Authorization:** Requires `admin` or `super_admin` role

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `userId`  | string | User ID     |

**Response:**

```json
{
  "success": true,
  "message": "Company user deleted successfully",
  "data": null
}
```

**Status Codes:** `200` Success · `400` Missing User ID · `401` Unauthorized · `403` Forbidden · `404` User not found · `500` Internal Server Error

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

## Notes

- Company creation automatically sets up a 30-day trial
- Soft delete preserves data but deactivates the company — use the restore endpoint to reactivate
- Routes marked with `requireAdminOrSuperAdmin` require `admin` or `super_admin` role
- All company operations are logged for audit purposes
- Company user creation uses express-validator for input validation
- Default role for new company users is `EMPLOYEE`
