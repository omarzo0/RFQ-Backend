# Company Template Controller

## Overview

Handles template management for company users including creation, updates, and organization of email and quote templates.

## Endpoints

### 1. Get All Templates

**GET** `/api/v1/company/templates`

**Description:** Get all templates for the company with filtering and pagination

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or description
- `category` (optional): Filter by template category
- `tradeLane` (optional): Filter by trade lane
- `language` (optional): Filter by language
- `isPublic` (optional): Filter by public status (true/false)
- `isActive` (optional): Filter by active status (true/false)
- `tags` (optional): Filter by tags
- `createdBy` (optional): Filter by creator
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): Sort order - asc/desc (default: desc)

**Response:**

```json
{
  "success": true,
  "message": "Templates retrieved successfully",
  "data": {
    "templates": [
      {
        "id": "template_123",
        "name": "Ocean Freight Quote Template",
        "description": "Template for ocean freight quotes",
        "category": "quote",
        "tradeLane": "Asia-North America",
        "language": "en",
        "isPublic": false,
        "isActive": true,
        "tags": ["ocean", "freight", "quote"],
        "createdBy": "user_456",
        "createdByName": "John Doe",
        "usageCount": 25,
        "lastUsedAt": "2024-01-01T00:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    },
    "summary": {
      "total": 50,
      "active": 45,
      "public": 10,
      "private": 40
    }
  }
}
```

**Status Codes:**

- `200` - Templates retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 2. Get Template by ID

**GET** `/api/v1/company/templates/:id`

**Description:** Get detailed information about a specific template

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Path Parameters:**

- `id`: Template ID

**Response:**

```json
{
  "success": true,
  "message": "Template retrieved successfully",
  "data": {
    "id": "template_123",
    "name": "Ocean Freight Quote Template",
    "description": "Template for ocean freight quotes",
    "category": "quote",
    "tradeLane": "Asia-North America",
    "language": "en",
    "isPublic": false,
    "isActive": true,
    "tags": ["ocean", "freight", "quote"],
    "createdBy": "user_456",
    "createdByName": "John Doe",
    "usageCount": 25,
    "lastUsedAt": "2024-01-01T00:00:00.000Z",
    "content": {
      "subject": "Quote for {{rfqTitle}} - {{companyName}}",
      "bodyHtml": "<h1>Quote for {{rfqTitle}}</h1><p>Dear {{contactName}},</p><p>We are pleased to provide our quote for your ocean freight requirements.</p>",
      "bodyText": "Quote for {{rfqTitle}} - Dear {{contactName}}, We are pleased to provide our quote for your ocean freight requirements.",
      "variables": ["rfqTitle", "contactName", "companyName", "quoteAmount"]
    },
    "attachments": [
      {
        "id": "attachment_123",
        "filename": "quote_template.pdf",
        "url": "https://yourdomain.com/attachments/quote_template.pdf",
        "size": 1024000
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Template retrieved successfully
- `401` - Unauthorized
- `404` - Template not found
- `500` - Internal server error

---

### 3. Create Template

**POST** `/api/v1/company/templates`

**Description:** Create a new template

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Air Freight Quote Template",
  "description": "Template for air freight quotes",
  "category": "quote",
  "tradeLane": "Asia-Europe",
  "language": "en",
  "isPublic": false,
  "tags": ["air", "freight", "quote"],
  "content": {
    "subject": "Air Freight Quote for {{rfqTitle}} - {{companyName}}",
    "bodyHtml": "<h1>Air Freight Quote for {{rfqTitle}}</h1><p>Dear {{contactName}},</p><p>We are pleased to provide our air freight quote.</p>",
    "bodyText": "Air Freight Quote for {{rfqTitle}} - Dear {{contactName}}, We are pleased to provide our air freight quote.",
    "variables": ["rfqTitle", "contactName", "companyName", "quoteAmount"]
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Template created successfully",
  "data": {
    "id": "template_124",
    "name": "Air Freight Quote Template",
    "description": "Template for air freight quotes",
    "category": "quote",
    "tradeLane": "Asia-Europe",
    "language": "en",
    "isPublic": false,
    "isActive": true,
    "tags": ["air", "freight", "quote"],
    "createdBy": "user_456",
    "createdByName": "John Doe",
    "usageCount": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `201` - Template created successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `500` - Internal server error

---

### 4. Update Template

**PUT** `/api/v1/company/templates/:id`

**Description:** Update an existing template

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: Template ID

**Request Body:**

```json
{
  "name": "Updated Ocean Freight Quote Template",
  "description": "Updated template for ocean freight quotes",
  "tags": ["ocean", "freight", "quote", "premium"],
  "content": {
    "subject": "Premium Ocean Freight Quote for {{rfqTitle}} - {{companyName}}",
    "bodyHtml": "<h1>Premium Ocean Freight Quote for {{rfqTitle}}</h1><p>Dear {{contactName}},</p><p>We are pleased to provide our premium ocean freight quote.</p>",
    "bodyText": "Premium Ocean Freight Quote for {{rfqTitle}} - Dear {{contactName}}, We are pleased to provide our premium ocean freight quote.",
    "variables": [
      "rfqTitle",
      "contactName",
      "companyName",
      "quoteAmount",
      "premiumService"
    ]
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Template updated successfully",
  "data": {
    "id": "template_123",
    "name": "Updated Ocean Freight Quote Template",
    "description": "Updated template for ocean freight quotes",
    "tags": ["ocean", "freight", "quote", "premium"],
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Template updated successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - Template not found
- `500` - Internal server error

---

### 5. Delete Template

**DELETE** `/api/v1/company/templates/:id`

**Description:** Delete a template

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Path Parameters:**

- `id`: Template ID

**Response:**

```json
{
  "success": true,
  "message": "Template deleted successfully",
  "data": {
    "id": "template_123",
    "deletedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Template deleted successfully
- `401` - Unauthorized
- `404` - Template not found
- `500` - Internal server error

---

### 6. Duplicate Template

**POST** `/api/v1/company/templates/:id/duplicate`

**Description:** Duplicate an existing template

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: Template ID

**Request Body:**

```json
{
  "name": "Copy of Ocean Freight Quote Template",
  "description": "Duplicate of the original template",
  "modifications": {
    "tradeLane": "Europe-Asia",
    "tags": ["ocean", "freight", "quote", "europe-asia"]
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Template duplicated successfully",
  "data": {
    "id": "template_125",
    "originalTemplateId": "template_123",
    "name": "Copy of Ocean Freight Quote Template",
    "description": "Duplicate of the original template",
    "tradeLane": "Europe-Asia",
    "tags": ["ocean", "freight", "quote", "europe-asia"],
    "createdBy": "user_456",
    "createdByName": "John Doe",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Status Codes:**

- `201` - Template duplicated successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - Template not found
- `500` - Internal server error

---

### 7. Get Template Categories

**GET** `/api/v1/company/templates/categories`

**Description:** Get available template categories

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Template categories retrieved successfully",
  "data": {
    "categories": [
      {
        "id": "quote",
        "name": "Quote Templates",
        "description": "Templates for quotes and proposals",
        "templateCount": 25
      },
      {
        "id": "email",
        "name": "Email Templates",
        "description": "Templates for emails and communications",
        "templateCount": 15
      },
      {
        "id": "follow-up",
        "name": "Follow-up Templates",
        "description": "Templates for follow-up communications",
        "templateCount": 10
      }
    ]
  }
}
```

**Status Codes:**

- `200` - Categories retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 8. Get Template Analytics

**GET** `/api/v1/company/templates/analytics`

**Description:** Get template usage analytics

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
  "message": "Template analytics retrieved successfully",
  "data": {
    "overview": {
      "totalTemplates": 50,
      "activeTemplates": 45,
      "totalUsage": 500,
      "averageUsagePerTemplate": 10
    },
    "byCategory": [
      {
        "category": "quote",
        "templateCount": 25,
        "usageCount": 300,
        "averageUsage": 12
      },
      {
        "category": "email",
        "templateCount": 15,
        "usageCount": 150,
        "averageUsage": 10
      }
    ],
    "topTemplates": [
      {
        "templateId": "template_123",
        "templateName": "Ocean Freight Quote Template",
        "usageCount": 50,
        "lastUsedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "templateId": "template_124",
        "templateName": "Air Freight Quote Template",
        "usageCount": 30,
        "lastUsedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "usageTrends": [
      {
        "date": "2024-01-01",
        "usageCount": 25
      },
      {
        "date": "2024-01-02",
        "usageCount": 30
      }
    ],
    "byTradeLane": [
      {
        "tradeLane": "Asia-North America",
        "templateCount": 20,
        "usageCount": 200
      },
      {
        "tradeLane": "Europe-Asia",
        "templateCount": 15,
        "usageCount": 150
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

### 9. Import Templates

**POST** `/api/v1/company/templates/import`

**Description:** Import templates from file

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: multipart/form-data
```

**Request Body:**

```
file: templates.json
category: quote
```

**Response:**

```json
{
  "success": true,
  "message": "Templates import initiated successfully",
  "data": {
    "importId": "import_123",
    "status": "processing",
    "totalTemplates": 10,
    "processedTemplates": 0,
    "successfulTemplates": 0,
    "failedTemplates": 0,
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

### 10. Export Templates

**GET** `/api/v1/company/templates/export`

**Description:** Export templates to file

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Query Parameters:**

- `format` (optional): Export format - json/csv (default: json)
- `category` (optional): Filter by category
- `tradeLane` (optional): Filter by trade lane

**Response:**

```json
{
  "success": true,
  "message": "Templates export initiated successfully",
  "data": {
    "exportId": "export_123",
    "status": "processing",
    "downloadUrl": "https://yourdomain.com/exports/templates_123.json",
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

## Template Categories

- **quote**: Quote templates
- **email**: Email templates
- **follow-up**: Follow-up templates
- **proposal**: Proposal templates
- **contract**: Contract templates
- **invoice**: Invoice templates

## Trade Lanes

- **Asia-North America**: Asia to North America
- **Asia-Europe**: Asia to Europe
- **Europe-Asia**: Europe to Asia
- **North America-Asia**: North America to Asia
- **Europe-North America**: Europe to North America
- **North America-Europe**: North America to Europe

## Languages

- **en**: English
- **es**: Spanish
- **fr**: French
- **de**: German
- **zh**: Chinese
- **ja**: Japanese

## Notes

- All template operations are logged for audit
- Templates support variable substitution
- Usage analytics are calculated in real-time
- Import/export operations are processed asynchronously
- All timestamps are in ISO 8601 format
