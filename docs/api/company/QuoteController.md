# Company Quote Controller

## Overview

Handles quote management for company users including creation, updates, tracking, and analytics.

## Endpoints

### 1. Get All Quotes

**GET** `/api/v1/company/quotes`

**Description:** Get all quotes for the company with filtering and pagination

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by quote details
- `rfqId` (optional): Filter by RFQ ID
- `contactId` (optional): Filter by contact ID
- `shippingLineId` (optional): Filter by shipping line ID
- `status` (optional): Filter by quote status
- `isWinner` (optional): Filter by winner status (true/false)
- `isAwarded` (optional): Filter by awarded status (true/false)
- `isExpired` (optional): Filter by expired status (true/false)
- `isVerified` (optional): Filter by verified status (true/false)
- `source` (optional): Filter by quote source
- `currency` (optional): Filter by currency
- `marketPosition` (optional): Filter by market position
- `tags` (optional): Filter by tags
- `dateFrom` (optional): Start date (ISO format)
- `dateTo` (optional): End date (ISO format)
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): Sort order - asc/desc (default: desc)

**Response:**

```json
{
  "success": true,
  "message": "Quotes retrieved successfully",
  "data": {
    "quotes": [
      {
        "id": "quote_123",
        "rfqId": "rfq_456",
        "rfqTitle": "Ocean Freight from Shanghai to Los Angeles",
        "contactId": "contact_789",
        "contactName": "ABC Shipping Co",
        "shippingLineId": "shipping_101",
        "shippingLineName": "Ocean Express",
        "status": "sent",
        "isWinner": false,
        "isAwarded": false,
        "isExpired": false,
        "isVerified": true,
        "source": "manual",
        "currency": "USD",
        "marketPosition": "competitive",
        "tags": ["ocean", "premium"],
        "totalAmount": 45000,
        "validUntil": "2024-02-01T00:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 200,
      "totalPages": 20
    },
    "summary": {
      "total": 200,
      "sent": 150,
      "accepted": 30,
      "rejected": 20
    }
  }
}
```

**Status Codes:**

- `200` - Quotes retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 2. Get Quote by ID

**GET** `/api/v1/company/quotes/:id`

**Description:** Get detailed information about a specific quote

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Path Parameters:**

- `id`: Quote ID

**Response:**

```json
{
  "success": true,
  "message": "Quote retrieved successfully",
  "data": {
    "id": "quote_123",
    "rfqId": "rfq_456",
    "rfqTitle": "Ocean Freight from Shanghai to Los Angeles",
    "contactId": "contact_789",
    "contactName": "ABC Shipping Co",
    "shippingLineId": "shipping_101",
    "shippingLineName": "Ocean Express",
    "status": "sent",
    "isWinner": false,
    "isAwarded": false,
    "isExpired": false,
    "isVerified": true,
    "source": "manual",
    "currency": "USD",
    "marketPosition": "competitive",
    "tags": ["ocean", "premium"],
    "totalAmount": 45000,
    "validUntil": "2024-02-01T00:00:00.000Z",
    "quoteDetails": {
      "origin": "Shanghai, China",
      "destination": "Los Angeles, USA",
      "transitTime": "14 days",
      "serviceType": "FCL",
      "containerType": "40ft HC",
      "freightCharges": 40000,
      "additionalCharges": 5000,
      "breakdown": [
        {
          "item": "Ocean Freight",
          "amount": 35000,
          "currency": "USD"
        },
        {
          "item": "Terminal Handling",
          "amount": 5000,
          "currency": "USD"
        }
      ]
    },
    "attachments": [
      {
        "id": "attachment_123",
        "filename": "quote_details.pdf",
        "url": "https://yourdomain.com/attachments/quote_details.pdf",
        "size": 1024000
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Quote retrieved successfully
- `401` - Unauthorized
- `404` - Quote not found
- `500` - Internal server error

---

### 3. Create Quote

**POST** `/api/v1/company/quotes`

**Description:** Create a new quote

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "rfqId": "rfq_456",
  "contactId": "contact_789",
  "shippingLineId": "shipping_101",
  "currency": "USD",
  "marketPosition": "competitive",
  "tags": ["ocean", "premium"],
  "totalAmount": 45000,
  "validUntil": "2024-02-01T00:00:00.000Z",
  "quoteDetails": {
    "origin": "Shanghai, China",
    "destination": "Los Angeles, USA",
    "transitTime": "14 days",
    "serviceType": "FCL",
    "containerType": "40ft HC",
    "freightCharges": 40000,
    "additionalCharges": 5000,
    "breakdown": [
      {
        "item": "Ocean Freight",
        "amount": 35000,
        "currency": "USD"
      },
      {
        "item": "Terminal Handling",
        "amount": 5000,
        "currency": "USD"
      }
    ]
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Quote created successfully",
  "data": {
    "id": "quote_123",
    "rfqId": "rfq_456",
    "contactId": "contact_789",
    "shippingLineId": "shipping_101",
    "status": "draft",
    "currency": "USD",
    "marketPosition": "competitive",
    "tags": ["ocean", "premium"],
    "totalAmount": 45000,
    "validUntil": "2024-02-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `201` - Quote created successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `500` - Internal server error

---

### 4. Update Quote

**PUT** `/api/v1/company/quotes/:id`

**Description:** Update an existing quote

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: Quote ID

**Request Body:**

```json
{
  "totalAmount": 47000,
  "marketPosition": "premium",
  "tags": ["ocean", "premium", "express"],
  "validUntil": "2024-02-15T00:00:00.000Z",
  "quoteDetails": {
    "transitTime": "12 days",
    "freightCharges": 42000,
    "additionalCharges": 5000
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Quote updated successfully",
  "data": {
    "id": "quote_123",
    "totalAmount": 47000,
    "marketPosition": "premium",
    "tags": ["ocean", "premium", "express"],
    "validUntil": "2024-02-15T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Quote updated successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - Quote not found
- `500` - Internal server error

---

### 5. Send Quote

**POST** `/api/v1/company/quotes/:id/send`

**Description:** Send a quote to the contact

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: Quote ID

**Request Body:**

```json
{
  "message": "Please find attached our competitive quote for your RFQ",
  "sendEmail": true,
  "emailTemplate": "quote_template_1"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Quote sent successfully",
  "data": {
    "id": "quote_123",
    "status": "sent",
    "sentAt": "2024-01-01T12:00:00.000Z",
    "emailSent": true,
    "emailId": "email_123",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Quote sent successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - Quote not found
- `500` - Internal server error

---

### 6. Accept Quote

**POST** `/api/v1/company/quotes/:id/accept`

**Description:** Accept a quote

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: Quote ID

**Request Body:**

```json
{
  "notes": "Quote accepted, please proceed with booking",
  "awardedAmount": 45000
}
```

**Response:**

```json
{
  "success": true,
  "message": "Quote accepted successfully",
  "data": {
    "id": "quote_123",
    "status": "accepted",
    "isWinner": true,
    "isAwarded": true,
    "awardedAmount": 45000,
    "acceptedAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Quote accepted successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - Quote not found
- `500` - Internal server error

---

### 7. Reject Quote

**POST** `/api/v1/company/quotes/:id/reject`

**Description:** Reject a quote

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: Quote ID

**Request Body:**

```json
{
  "reason": "Price too high",
  "notes": "Thank you for your quote, but we found a better offer"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Quote rejected successfully",
  "data": {
    "id": "quote_123",
    "status": "rejected",
    "rejectionReason": "Price too high",
    "rejectedAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Quote rejected successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - Quote not found
- `500` - Internal server error

---

### 8. Get Quote Analytics

**GET** `/api/v1/company/quotes/analytics`

**Description:** Get quote analytics and statistics

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
  "message": "Quote analytics retrieved successfully",
  "data": {
    "overview": {
      "totalQuotes": 200,
      "sentQuotes": 150,
      "acceptedQuotes": 30,
      "rejectedQuotes": 20,
      "acceptanceRate": 20,
      "averageQuoteValue": 45000
    },
    "byStatus": [
      {
        "status": "sent",
        "count": 150,
        "percentage": 75
      },
      {
        "status": "accepted",
        "count": 30,
        "percentage": 15
      }
    ],
    "byMarketPosition": [
      {
        "position": "competitive",
        "count": 100,
        "percentage": 50
      },
      {
        "position": "premium",
        "count": 80,
        "percentage": 40
      }
    ],
    "trends": [
      {
        "month": "2024-01",
        "created": 50,
        "sent": 40,
        "accepted": 8
      },
      {
        "month": "2024-02",
        "created": 60,
        "sent": 50,
        "accepted": 10
      }
    ],
    "topContacts": [
      {
        "contactId": "contact_789",
        "contactName": "ABC Shipping Co",
        "quoteCount": 25,
        "acceptanceRate": 30
      }
    ],
    "topShippingLines": [
      {
        "shippingLineId": "shipping_101",
        "shippingLineName": "Ocean Express",
        "quoteCount": 30,
        "acceptanceRate": 25
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

### 9. Duplicate Quote

**POST** `/api/v1/company/quotes/:id/duplicate`

**Description:** Duplicate an existing quote

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: Quote ID

**Request Body:**

```json
{
  "rfqId": "rfq_789",
  "contactId": "contact_456",
  "modifications": {
    "totalAmount": 48000,
    "validUntil": "2024-03-01T00:00:00.000Z"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Quote duplicated successfully",
  "data": {
    "id": "quote_124",
    "originalQuoteId": "quote_123",
    "rfqId": "rfq_789",
    "contactId": "contact_456",
    "status": "draft",
    "totalAmount": 48000,
    "validUntil": "2024-03-01T00:00:00.000Z",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Status Codes:**

- `201` - Quote duplicated successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - Quote not found
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

## Quote Statuses

- **draft**: Quote is being prepared
- **sent**: Quote has been sent to contact
- **accepted**: Quote has been accepted
- **rejected**: Quote has been rejected
- **expired**: Quote has expired
- **cancelled**: Quote has been cancelled

## Market Positions

- **budget**: Budget-friendly option
- **competitive**: Competitive pricing
- **premium**: Premium service
- **exclusive**: Exclusive offering

## Quote Sources

- **manual**: Manually created
- **template**: Created from template
- **ai**: AI-generated
- **imported**: Imported from external source

## Notes

- All quote operations are logged for audit
- Quote sending triggers email notifications
- Quote acceptance automatically updates RFQ status
- Quote analytics are calculated in real-time
- All timestamps are in ISO 8601 format
