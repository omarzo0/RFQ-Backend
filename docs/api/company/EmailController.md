# Company Email Controller

## Overview

Handles email management for company users including sending emails, managing templates, campaigns, and follow-ups.

## Endpoints

### 1. Send Email

**POST** `/api/v1/company/emails/send`

**Description:** Send an email to a contact

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "toEmail": "contact@shippingco.com",
  "fromEmail": "sales@yourcompany.com",
  "subject": "Quote for Ocean Freight Services",
  "bodyHtml": "<h1>Quote Details</h1><p>Please find our quote attached.</p>",
  "bodyText": "Quote Details - Please find our quote attached.",
  "rfqId": "rfq_123",
  "contactId": "contact_456",
  "templateId": "template_789",
  "emailType": "QUOTE_RESPONSE",
  "priority": "HIGH",
  "personalizationData": {
    "contactName": "John Doe",
    "companyName": "ABC Shipping Co"
  },
  "scheduledFor": "2024-01-01T10:00:00.000Z"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Email sent successfully",
  "data": {
    "emailId": "email_123",
    "toEmail": "contact@shippingco.com",
    "subject": "Quote for Ocean Freight Services",
    "status": "sent",
    "sentAt": "2024-01-01T10:00:00.000Z",
    "trackingId": "track_123"
  }
}
```

**Status Codes:**

- `200` - Email sent successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `500` - Internal server error

---

### 2. Get Email History

**GET** `/api/v1/company/emails`

**Description:** Get email history with filtering and pagination

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by subject or recipient
- `emailType` (optional): Filter by email type
- `status` (optional): Filter by email status
- `contactId` (optional): Filter by contact ID
- `rfqId` (optional): Filter by RFQ ID
- `dateFrom` (optional): Start date (ISO format)
- `dateTo` (optional): End date (ISO format)

**Response:**

```json
{
  "success": true,
  "message": "Email history retrieved successfully",
  "data": {
    "emails": [
      {
        "id": "email_123",
        "toEmail": "contact@shippingco.com",
        "fromEmail": "sales@yourcompany.com",
        "subject": "Quote for Ocean Freight Services",
        "emailType": "QUOTE_RESPONSE",
        "status": "sent",
        "priority": "HIGH",
        "contactId": "contact_456",
        "contactName": "John Doe",
        "rfqId": "rfq_123",
        "rfqTitle": "Ocean Freight from Shanghai to Los Angeles",
        "sentAt": "2024-01-01T10:00:00.000Z",
        "openedAt": "2024-01-01T11:00:00.000Z",
        "clickedAt": "2024-01-01T11:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 500,
      "totalPages": 50
    },
    "summary": {
      "total": 500,
      "sent": 450,
      "delivered": 420,
      "opened": 300,
      "clicked": 150
    }
  }
}
```

**Status Codes:**

- `200` - Email history retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 3. Get Email by ID

**GET** `/api/v1/company/emails/:id`

**Description:** Get detailed information about a specific email

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Path Parameters:**

- `id`: Email ID

**Response:**

```json
{
  "success": true,
  "message": "Email retrieved successfully",
  "data": {
    "id": "email_123",
    "toEmail": "contact@shippingco.com",
    "fromEmail": "sales@yourcompany.com",
    "subject": "Quote for Ocean Freight Services",
    "bodyHtml": "<h1>Quote Details</h1><p>Please find our quote attached.</p>",
    "bodyText": "Quote Details - Please find our quote attached.",
    "emailType": "QUOTE_RESPONSE",
    "status": "sent",
    "priority": "HIGH",
    "contactId": "contact_456",
    "contactName": "John Doe",
    "rfqId": "rfq_123",
    "rfqTitle": "Ocean Freight from Shanghai to Los Angeles",
    "templateId": "template_789",
    "templateName": "Quote Response Template",
    "personalizationData": {
      "contactName": "John Doe",
      "companyName": "ABC Shipping Co"
    },
    "trackingId": "track_123",
    "sentAt": "2024-01-01T10:00:00.000Z",
    "deliveredAt": "2024-01-01T10:05:00.000Z",
    "openedAt": "2024-01-01T11:00:00.000Z",
    "clickedAt": "2024-01-01T11:30:00.000Z",
    "attachments": [
      {
        "id": "attachment_123",
        "filename": "quote.pdf",
        "url": "https://yourdomain.com/attachments/quote.pdf",
        "size": 1024000
      }
    ],
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T11:30:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Email retrieved successfully
- `401` - Unauthorized
- `404` - Email not found
- `500` - Internal server error

---

### 4. Get Email Templates

**GET** `/api/v1/company/emails/templates`

**Description:** Get email templates

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or description
- `emailType` (optional): Filter by email type
- `isActive` (optional): Filter by active status (true/false)

**Response:**

```json
{
  "success": true,
  "message": "Email templates retrieved successfully",
  "data": {
    "templates": [
      {
        "id": "template_123",
        "name": "Quote Response Template",
        "description": "Template for responding to RFQs",
        "emailType": "QUOTE_RESPONSE",
        "subject": "Quote for {{rfqTitle}}",
        "bodyHtml": "<h1>Quote for {{rfqTitle}}</h1><p>Dear {{contactName}},</p>",
        "bodyText": "Quote for {{rfqTitle}} - Dear {{contactName}},",
        "isActive": true,
        "variables": ["rfqTitle", "contactName", "companyName"],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

**Status Codes:**

- `200` - Templates retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 5. Create Email Template

**POST** `/api/v1/company/emails/templates`

**Description:** Create a new email template

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Follow-up Template",
  "description": "Template for follow-up emails",
  "emailType": "FOLLOW_UP",
  "subject": "Follow-up on {{rfqTitle}}",
  "bodyHtml": "<h1>Follow-up on {{rfqTitle}}</h1><p>Dear {{contactName}},</p><p>We wanted to follow up on your RFQ.</p>",
  "bodyText": "Follow-up on {{rfqTitle}} - Dear {{contactName}}, We wanted to follow up on your RFQ.",
  "variables": ["rfqTitle", "contactName", "companyName"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Email template created successfully",
  "data": {
    "id": "template_124",
    "name": "Follow-up Template",
    "description": "Template for follow-up emails",
    "emailType": "FOLLOW_UP",
    "subject": "Follow-up on {{rfqTitle}}",
    "bodyHtml": "<h1>Follow-up on {{rfqTitle}}</h1><p>Dear {{contactName}},</p><p>We wanted to follow up on your RFQ.</p>",
    "bodyText": "Follow-up on {{rfqTitle}} - Dear {{contactName}}, We wanted to follow up on your RFQ.",
    "isActive": true,
    "variables": ["rfqTitle", "contactName", "companyName"],
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

### 6. Update Email Template

**PUT** `/api/v1/company/emails/templates/:id`

**Description:** Update an existing email template

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
  "name": "Updated Follow-up Template",
  "description": "Updated template for follow-up emails",
  "subject": "Updated Follow-up on {{rfqTitle}}",
  "bodyHtml": "<h1>Updated Follow-up on {{rfqTitle}}</h1><p>Dear {{contactName}},</p><p>We wanted to follow up on your RFQ.</p>",
  "bodyText": "Updated Follow-up on {{rfqTitle}} - Dear {{contactName}}, We wanted to follow up on your RFQ."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Email template updated successfully",
  "data": {
    "id": "template_124",
    "name": "Updated Follow-up Template",
    "description": "Updated template for follow-up emails",
    "subject": "Updated Follow-up on {{rfqTitle}}",
    "bodyHtml": "<h1>Updated Follow-up on {{rfqTitle}}</h1><p>Dear {{contactName}},</p><p>We wanted to follow up on your RFQ.</p>",
    "bodyText": "Updated Follow-up on {{rfqTitle}} - Dear {{contactName}}, We wanted to follow up on your RFQ.",
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

### 7. Get Email Campaigns

**GET** `/api/v1/company/emails/campaigns`

**Description:** Get email campaigns

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by campaign status
- `search` (optional): Search by name or description

**Response:**

```json
{
  "success": true,
  "message": "Email campaigns retrieved successfully",
  "data": {
    "campaigns": [
      {
        "id": "campaign_123",
        "name": "Q1 2024 Follow-up Campaign",
        "description": "Follow-up campaign for Q1 2024",
        "status": "active",
        "templateId": "template_789",
        "templateName": "Follow-up Template",
        "targetContacts": 100,
        "sentEmails": 75,
        "openedEmails": 50,
        "clickedEmails": 25,
        "scheduledFor": "2024-01-01T10:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "totalPages": 2
    }
  }
}
```

**Status Codes:**

- `200` - Campaigns retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 8. Create Email Campaign

**POST** `/api/v1/company/emails/campaigns`

**Description:** Create a new email campaign

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Q2 2024 Follow-up Campaign",
  "description": "Follow-up campaign for Q2 2024",
  "templateId": "template_789",
  "targetContactIds": ["contact_123", "contact_456"],
  "scheduledFor": "2024-04-01T10:00:00.000Z",
  "personalizationData": {
    "companyName": "Your Company",
    "quarter": "Q2 2024"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Email campaign created successfully",
  "data": {
    "id": "campaign_124",
    "name": "Q2 2024 Follow-up Campaign",
    "description": "Follow-up campaign for Q2 2024",
    "status": "scheduled",
    "templateId": "template_789",
    "templateName": "Follow-up Template",
    "targetContacts": 2,
    "sentEmails": 0,
    "openedEmails": 0,
    "clickedEmails": 0,
    "scheduledFor": "2024-04-01T10:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `201` - Campaign created successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `500` - Internal server error

---

### 9. Get Email Analytics

**GET** `/api/v1/company/emails/analytics`

**Description:** Get email analytics and statistics

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
  "message": "Email analytics retrieved successfully",
  "data": {
    "overview": {
      "totalEmails": 1000,
      "sentEmails": 950,
      "deliveredEmails": 900,
      "openedEmails": 600,
      "clickedEmails": 300,
      "deliveryRate": 94.7,
      "openRate": 66.7,
      "clickRate": 50.0
    },
    "byType": [
      {
        "emailType": "QUOTE_RESPONSE",
        "sent": 400,
        "opened": 280,
        "clicked": 140,
        "openRate": 70.0,
        "clickRate": 50.0
      },
      {
        "emailType": "FOLLOW_UP",
        "sent": 300,
        "opened": 180,
        "clicked": 90,
        "openRate": 60.0,
        "clickRate": 50.0
      }
    ],
    "trends": [
      {
        "date": "2024-01-01",
        "sent": 50,
        "opened": 35,
        "clicked": 18
      },
      {
        "date": "2024-01-02",
        "sent": 60,
        "opened": 40,
        "clicked": 20
      }
    ],
    "topTemplates": [
      {
        "templateId": "template_123",
        "templateName": "Quote Response Template",
        "sent": 200,
        "openRate": 75.0,
        "clickRate": 45.0
      }
    ],
    "topContacts": [
      {
        "contactId": "contact_123",
        "contactName": "John Doe",
        "emailsSent": 25,
        "openRate": 80.0,
        "clickRate": 60.0
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

### 10. Get Follow-up Rules

**GET** `/api/v1/company/emails/follow-up-rules`

**Description:** Get follow-up rules

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Follow-up rules retrieved successfully",
  "data": {
    "rules": [
      {
        "id": "rule_123",
        "name": "Quote Follow-up Rule",
        "description": "Follow up on quotes after 3 days",
        "triggerEvent": "QUOTE_SENT",
        "delayDays": 3,
        "templateId": "template_789",
        "templateName": "Follow-up Template",
        "isActive": true,
        "maxFollowUps": 3,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

**Status Codes:**

- `200` - Follow-up rules retrieved successfully
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

## Email Types

- **RFQ_NOTIFICATION**: RFQ notifications
- **QUOTE_RESPONSE**: Quote responses
- **FOLLOW_UP**: Follow-up emails
- **BULK_EMAIL**: Bulk emails
- **CAMPAIGN**: Campaign emails
- **NOTIFICATION**: General notifications
- **SYSTEM**: System emails
- **PAYMENT_CONFIRMATION**: Payment confirmations
- **TRIAL_WARNING**: Trial warnings
- **TRIAL_EXPIRED**: Trial expired notifications
- **PAYMENT_RECEIPT**: Payment receipts

## Email Statuses

- **draft**: Email is being prepared
- **scheduled**: Email is scheduled
- **sent**: Email has been sent
- **delivered**: Email has been delivered
- **opened**: Email has been opened
- **clicked**: Email has been clicked
- **bounced**: Email bounced
- **failed**: Email failed to send

## Campaign Statuses

- **draft**: Campaign is being prepared
- **scheduled**: Campaign is scheduled
- **active**: Campaign is running
- **paused**: Campaign is paused
- **completed**: Campaign is completed
- **cancelled**: Campaign is cancelled

## Notes

- All email operations are logged for audit
- Email tracking is enabled by default
- Templates support variable substitution
- Campaigns can be scheduled for future execution
- Follow-up rules are processed automatically
- All timestamps are in ISO 8601 format
