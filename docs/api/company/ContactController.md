# Company Contact Controller

## Overview

Handles contact management for company users including creation, updates, tracking, and CRM operations.

## Endpoints

### 1. Get All Contacts

**GET** `/api/v1/company/contacts`

**Description:** Get all contacts for the company with filtering and pagination

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name, email, or company
- `status` (optional): Filter by contact status
- `shippingLineId` (optional): Filter by shipping line ID
- `department` (optional): Filter by department
- `tag` (optional): Filter by tag
- `seniority` (optional): Filter by seniority level
- `specialization` (optional): Filter by specialization
- `isPrimary` (optional): Filter by primary contact status (true/false)
- `doNotContact` (optional): Filter by do not contact status (true/false)

**Response:**

```json
{
  "success": true,
  "message": "Contacts retrieved successfully",
  "data": {
    "contacts": [
      {
        "id": "contact_123",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@shippingco.com",
        "phone": "+1234567890",
        "company": "ABC Shipping Co",
        "position": "Sales Manager",
        "department": "Sales",
        "status": "active",
        "shippingLineId": "shipping_101",
        "shippingLineName": "Ocean Express",
        "seniority": "senior",
        "specialization": "Ocean Freight",
        "isPrimary": true,
        "doNotContact": false,
        "tags": ["ocean", "premium"],
        "lastContactDate": "2024-01-01T00:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "totalPages": 15
    },
    "summary": {
      "total": 150,
      "active": 120,
      "inactive": 30,
      "primary": 25
    }
  }
}
```

**Status Codes:**

- `200` - Contacts retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 2. Get Contact by ID

**GET** `/api/v1/company/contacts/:id`

**Description:** Get detailed information about a specific contact

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Path Parameters:**

- `id`: Contact ID

**Response:**

```json
{
  "success": true,
  "message": "Contact retrieved successfully",
  "data": {
    "id": "contact_123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@shippingco.com",
    "phone": "+1234567890",
    "company": "ABC Shipping Co",
    "position": "Sales Manager",
    "department": "Sales",
    "status": "active",
    "shippingLineId": "shipping_101",
    "shippingLineName": "Ocean Express",
    "seniority": "senior",
    "specialization": "Ocean Freight",
    "isPrimary": true,
    "doNotContact": false,
    "tags": ["ocean", "premium"],
    "address": {
      "street": "123 Shipping St",
      "city": "Shanghai",
      "state": "Shanghai",
      "country": "China",
      "postalCode": "200000"
    },
    "socialMedia": {
      "linkedin": "https://linkedin.com/in/johndoe",
      "twitter": "@johndoe"
    },
    "notes": "Key decision maker for ocean freight",
    "lastContactDate": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "quotes": [
      {
        "id": "quote_456",
        "rfqTitle": "Ocean Freight from Shanghai to Los Angeles",
        "amount": 45000,
        "status": "sent",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

**Status Codes:**

- `200` - Contact retrieved successfully
- `401` - Unauthorized
- `404` - Contact not found
- `500` - Internal server error

---

### 3. Create Contact

**POST** `/api/v1/company/contacts`

**Description:** Create a new contact

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@shippingco.com",
  "phone": "+1234567890",
  "company": "ABC Shipping Co",
  "position": "Sales Manager",
  "department": "Sales",
  "shippingLineId": "shipping_101",
  "seniority": "senior",
  "specialization": "Ocean Freight",
  "isPrimary": true,
  "tags": ["ocean", "premium"],
  "address": {
    "street": "123 Shipping St",
    "city": "Shanghai",
    "state": "Shanghai",
    "country": "China",
    "postalCode": "200000"
  },
  "socialMedia": {
    "linkedin": "https://linkedin.com/in/johndoe",
    "twitter": "@johndoe"
  },
  "notes": "Key decision maker for ocean freight"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Contact created successfully",
  "data": {
    "id": "contact_123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@shippingco.com",
    "phone": "+1234567890",
    "company": "ABC Shipping Co",
    "position": "Sales Manager",
    "department": "Sales",
    "status": "active",
    "shippingLineId": "shipping_101",
    "shippingLineName": "Ocean Express",
    "seniority": "senior",
    "specialization": "Ocean Freight",
    "isPrimary": true,
    "doNotContact": false,
    "tags": ["ocean", "premium"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `201` - Contact created successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `409` - Contact already exists
- `500` - Internal server error

---

### 4. Update Contact

**PUT** `/api/v1/company/contacts/:id`

**Description:** Update an existing contact

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: Contact ID

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@shippingco.com",
  "phone": "+1234567890",
  "position": "Senior Sales Manager",
  "department": "Sales",
  "seniority": "executive",
  "tags": ["ocean", "premium", "executive"],
  "notes": "Promoted to Senior Sales Manager"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Contact updated successfully",
  "data": {
    "id": "contact_123",
    "firstName": "John",
    "lastName": "Smith",
    "email": "john.smith@shippingco.com",
    "phone": "+1234567890",
    "position": "Senior Sales Manager",
    "department": "Sales",
    "seniority": "executive",
    "tags": ["ocean", "premium", "executive"],
    "notes": "Promoted to Senior Sales Manager",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Contact updated successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - Contact not found
- `500` - Internal server error

---

### 5. Delete Contact

**DELETE** `/api/v1/company/contacts/:id`

**Description:** Delete a contact

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Path Parameters:**

- `id`: Contact ID

**Response:**

```json
{
  "success": true,
  "message": "Contact deleted successfully",
  "data": {
    "id": "contact_123",
    "deletedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Contact deleted successfully
- `401` - Unauthorized
- `404` - Contact not found
- `500` - Internal server error

---

### 6. Update Contact Status

**PATCH** `/api/v1/company/contacts/:id/status`

**Description:** Update contact status

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: Contact ID

**Request Body:**

```json
{
  "status": "inactive",
  "reason": "Left the company"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Contact status updated successfully",
  "data": {
    "id": "contact_123",
    "status": "inactive",
    "reason": "Left the company",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Status updated successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - Contact not found
- `500` - Internal server error

---

### 7. Add Contact Note

**POST** `/api/v1/company/contacts/:id/notes`

**Description:** Add a note to a contact

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: Contact ID

**Request Body:**

```json
{
  "note": "Met at shipping conference, interested in new routes",
  "type": "meeting",
  "isImportant": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Note added successfully",
  "data": {
    "id": "note_123",
    "contactId": "contact_123",
    "note": "Met at shipping conference, interested in new routes",
    "type": "meeting",
    "isImportant": true,
    "createdBy": "user_789",
    "createdByName": "Jane Smith",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Status Codes:**

- `201` - Note added successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - Contact not found
- `500` - Internal server error

---

### 8. Get Contact Analytics

**GET** `/api/v1/company/contacts/analytics`

**Description:** Get contact analytics and statistics

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Query Parameters:**

- `period` (optional): Time period (7d, 30d, 90d, 1y)

**Response:**

```json
{
  "success": true,
  "message": "Contact analytics retrieved successfully",
  "data": {
    "overview": {
      "totalContacts": 150,
      "activeContacts": 120,
      "inactiveContacts": 30,
      "primaryContacts": 25,
      "newContactsThisMonth": 15
    },
    "byStatus": [
      {
        "status": "active",
        "count": 120,
        "percentage": 80
      },
      {
        "status": "inactive",
        "count": 30,
        "percentage": 20
      }
    ],
    "byDepartment": [
      {
        "department": "Sales",
        "count": 60,
        "percentage": 40
      },
      {
        "department": "Operations",
        "count": 45,
        "percentage": 30
      }
    ],
    "bySeniority": [
      {
        "seniority": "senior",
        "count": 50,
        "percentage": 33.3
      },
      {
        "seniority": "mid",
        "count": 70,
        "percentage": 46.7
      }
    ],
    "bySpecialization": [
      {
        "specialization": "Ocean Freight",
        "count": 80,
        "percentage": 53.3
      },
      {
        "specialization": "Air Freight",
        "count": 40,
        "percentage": 26.7
      }
    ],
    "topCompanies": [
      {
        "company": "ABC Shipping Co",
        "contactCount": 15,
        "percentage": 10
      },
      {
        "company": "XYZ Logistics",
        "contactCount": 12,
        "percentage": 8
      }
    ],
    "contactGrowth": [
      {
        "month": "2024-01",
        "newContacts": 10,
        "totalContacts": 140
      },
      {
        "month": "2024-02",
        "newContacts": 15,
        "totalContacts": 155
      }
    ]
  }
}
```

**Status Codes:**

- `200` - Analytics retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 9. Import Contacts

**POST** `/api/v1/company/contacts/import`

**Description:** Import contacts from CSV file

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: multipart/form-data
```

**Request Body:**

```
file: contacts.csv
mapping: {
  "firstName": "First Name",
  "lastName": "Last Name",
  "email": "Email",
  "phone": "Phone",
  "company": "Company"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Contacts import initiated successfully",
  "data": {
    "importId": "import_123",
    "status": "processing",
    "totalRows": 100,
    "processedRows": 0,
    "successfulRows": 0,
    "failedRows": 0,
    "errors": []
  }
}
```

**Status Codes:**

- `200` - Import initiated successfully
- `400` - Invalid file format
- `401` - Unauthorized
- `500` - Internal server error

---

### 10. Export Contacts

**GET** `/api/v1/company/contacts/export`

**Description:** Export contacts to CSV file

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Query Parameters:**

- `format` (optional): Export format - csv/excel (default: csv)
- `status` (optional): Filter by status
- `department` (optional): Filter by department

**Response:**

```json
{
  "success": true,
  "message": "Contacts export initiated successfully",
  "data": {
    "exportId": "export_123",
    "status": "processing",
    "downloadUrl": "https://yourdomain.com/exports/contacts_123.csv",
    "expiresAt": "2024-01-02T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Export initiated successfully
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

All endpoints require a valid company JWT token in the Authorization header:

```
Authorization: Bearer <company_jwt_token>
```

## Contact Statuses

- **active**: Contact is active
- **inactive**: Contact is inactive
- **archived**: Contact is archived

## Seniority Levels

- **junior**: Junior level
- **mid**: Mid-level
- **senior**: Senior level
- **executive**: Executive level

## Specializations

- **Ocean Freight**: Ocean shipping
- **Air Freight**: Air shipping
- **Land Freight**: Land shipping
- **Logistics**: General logistics
- **Customs**: Customs clearance

## Note Types

- **meeting**: Meeting notes
- **call**: Phone call notes
- **email**: Email correspondence
- **general**: General notes
- **important**: Important notes

## Notes

- All contact operations are logged for audit
- Contact updates trigger email notifications
- Import/export operations are processed asynchronously
- Contact analytics are calculated in real-time
- All timestamps are in ISO 8601 format
