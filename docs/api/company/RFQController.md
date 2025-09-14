# Company RFQ Controller

## Overview

Handles RFQ (Request for Quotation) management for company users including creation, updates, tracking, and analytics.

## Endpoints

### 1. Get All RFQs

**GET** `/api/v1/company/rfqs`

**Description:** Get all RFQs for the company with filtering and pagination

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by title or description
- `status` (optional): Filter by RFQ status
- `priority` (optional): Filter by priority level
- `urgency` (optional): Filter by urgency level
- `tradeLane` (optional): Filter by trade lane
- `tag` (optional): Filter by tag
- `assignedTo` (optional): Filter by assigned user
- `createdBy` (optional): Filter by creator
- `dateFrom` (optional): Start date (ISO format)
- `dateTo` (optional): End date (ISO format)

**Response:**

```json
{
  "success": true,
  "message": "RFQs retrieved successfully",
  "data": {
    "rfqs": [
      {
        "id": "rfq_123",
        "title": "Ocean Freight from Shanghai to Los Angeles",
        "description": "Need ocean freight services for 20 containers",
        "status": "active",
        "priority": "high",
        "urgency": "urgent",
        "tradeLane": "Asia-North America",
        "tags": ["ocean", "containers"],
        "assignedTo": "user_456",
        "assignedUserName": "John Doe",
        "createdBy": "user_789",
        "createdByName": "Jane Smith",
        "budget": 50000,
        "currency": "USD",
        "deadline": "2024-02-01T00:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    },
    "summary": {
      "total": 100,
      "active": 25,
      "completed": 60,
      "cancelled": 15
    }
  }
}
```

**Status Codes:**

- `200` - RFQs retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 2. Get RFQ by ID

**GET** `/api/v1/company/rfqs/:id`

**Description:** Get detailed information about a specific RFQ

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Path Parameters:**

- `id`: RFQ ID

**Response:**

```json
{
  "success": true,
  "message": "RFQ retrieved successfully",
  "data": {
    "id": "rfq_123",
    "title": "Ocean Freight from Shanghai to Los Angeles",
    "description": "Need ocean freight services for 20 containers",
    "status": "active",
    "priority": "high",
    "urgency": "urgent",
    "tradeLane": "Asia-North America",
    "tags": ["ocean", "containers"],
    "assignedTo": "user_456",
    "assignedUserName": "John Doe",
    "createdBy": "user_789",
    "createdByName": "Jane Smith",
    "budget": 50000,
    "currency": "USD",
    "deadline": "2024-02-01T00:00:00.000Z",
    "requirements": {
      "origin": "Shanghai, China",
      "destination": "Los Angeles, USA",
      "cargoType": "General Cargo",
      "weight": "50000 kg",
      "volume": "1000 m³",
      "specialRequirements": "Temperature controlled"
    },
    "quotes": [
      {
        "id": "quote_123",
        "supplierName": "Ocean Shipping Co",
        "amount": 45000,
        "currency": "USD",
        "validUntil": "2024-01-15T00:00:00.000Z",
        "status": "pending"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - RFQ retrieved successfully
- `401` - Unauthorized
- `404` - RFQ not found
- `500` - Internal server error

---

### 3. Create RFQ

**POST** `/api/v1/company/rfqs`

**Description:** Create a new RFQ

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "Ocean Freight from Shanghai to Los Angeles",
  "description": "Need ocean freight services for 20 containers",
  "priority": "high",
  "urgency": "urgent",
  "tradeLane": "Asia-North America",
  "tags": ["ocean", "containers"],
  "assignedTo": "user_456",
  "budget": 50000,
  "currency": "USD",
  "deadline": "2024-02-01T00:00:00.000Z",
  "requirements": {
    "origin": "Shanghai, China",
    "destination": "Los Angeles, USA",
    "cargoType": "General Cargo",
    "weight": "50000 kg",
    "volume": "1000 m³",
    "specialRequirements": "Temperature controlled"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "RFQ created successfully",
  "data": {
    "id": "rfq_123",
    "title": "Ocean Freight from Shanghai to Los Angeles",
    "description": "Need ocean freight services for 20 containers",
    "status": "active",
    "priority": "high",
    "urgency": "urgent",
    "tradeLane": "Asia-North America",
    "tags": ["ocean", "containers"],
    "assignedTo": "user_456",
    "assignedUserName": "John Doe",
    "createdBy": "user_789",
    "createdByName": "Jane Smith",
    "budget": 50000,
    "currency": "USD",
    "deadline": "2024-02-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `201` - RFQ created successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `500` - Internal server error

---

### 4. Update RFQ

**PUT** `/api/v1/company/rfqs/:id`

**Description:** Update an existing RFQ

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: RFQ ID

**Request Body:**

```json
{
  "title": "Updated Ocean Freight from Shanghai to Los Angeles",
  "description": "Updated description for ocean freight services",
  "priority": "medium",
  "urgency": "normal",
  "budget": 55000,
  "deadline": "2024-02-15T00:00:00.000Z"
}
```

**Response:**

```json
{
  "success": true,
  "message": "RFQ updated successfully",
  "data": {
    "id": "rfq_123",
    "title": "Updated Ocean Freight from Shanghai to Los Angeles",
    "description": "Updated description for ocean freight services",
    "priority": "medium",
    "urgency": "normal",
    "budget": 55000,
    "deadline": "2024-02-15T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - RFQ updated successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - RFQ not found
- `500` - Internal server error

---

### 5. Delete RFQ

**DELETE** `/api/v1/company/rfqs/:id`

**Description:** Delete an RFQ

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Path Parameters:**

- `id`: RFQ ID

**Response:**

```json
{
  "success": true,
  "message": "RFQ deleted successfully",
  "data": {
    "id": "rfq_123",
    "deletedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - RFQ deleted successfully
- `401` - Unauthorized
- `404` - RFQ not found
- `500` - Internal server error

---

### 6. Update RFQ Status

**PATCH** `/api/v1/company/rfqs/:id/status`

**Description:** Update RFQ status

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: RFQ ID

**Request Body:**

```json
{
  "status": "completed",
  "notes": "RFQ completed successfully"
}
```

**Response:**

```json
{
  "success": true,
  "message": "RFQ status updated successfully",
  "data": {
    "id": "rfq_123",
    "status": "completed",
    "notes": "RFQ completed successfully",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - Status updated successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - RFQ not found
- `500` - Internal server error

---

### 7. Assign RFQ

**PUT** `/api/v1/company/rfqs/:id/assign`

**Description:** Assign RFQ to a user

**Headers:**

```
Authorization: Bearer <company_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: RFQ ID

**Request Body:**

```json
{
  "assignedTo": "user_456",
  "notes": "Assigned to John Doe for handling"
}
```

**Response:**

```json
{
  "success": true,
  "message": "RFQ assigned successfully",
  "data": {
    "id": "rfq_123",
    "assignedTo": "user_456",
    "assignedUserName": "John Doe",
    "notes": "Assigned to John Doe for handling",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Status Codes:**

- `200` - RFQ assigned successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - RFQ not found
- `500` - Internal server error

---

### 8. Get RFQ Analytics

**GET** `/api/v1/company/rfqs/analytics`

**Description:** Get RFQ analytics and statistics

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
  "message": "RFQ analytics retrieved successfully",
  "data": {
    "overview": {
      "totalRFQs": 100,
      "activeRFQs": 25,
      "completedRFQs": 60,
      "cancelledRFQs": 15,
      "averageProcessingTime": 72
    },
    "byStatus": [
      {
        "status": "active",
        "count": 25,
        "percentage": 25
      },
      {
        "status": "completed",
        "count": 60,
        "percentage": 60
      }
    ],
    "byPriority": [
      {
        "priority": "high",
        "count": 30,
        "percentage": 30
      },
      {
        "priority": "medium",
        "count": 50,
        "percentage": 50
      }
    ],
    "trends": [
      {
        "month": "2024-01",
        "created": 20,
        "completed": 15,
        "cancelled": 2
      },
      {
        "month": "2024-02",
        "created": 25,
        "completed": 20,
        "cancelled": 1
      }
    ],
    "topTradeLanes": [
      {
        "tradeLane": "Asia-North America",
        "count": 40,
        "percentage": 40
      },
      {
        "tradeLane": "Europe-Asia",
        "count": 30,
        "percentage": 30
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

## RFQ Statuses

- **draft**: RFQ is being prepared
- **active**: RFQ is open for quotes
- **completed**: RFQ has been completed
- **cancelled**: RFQ has been cancelled
- **expired**: RFQ has expired

## Priority Levels

- **low**: Low priority
- **medium**: Medium priority
- **high**: High priority
- **urgent**: Urgent priority

## Urgency Levels

- **normal**: Normal urgency
- **urgent**: Urgent
- **critical**: Critical

## Notes

- All RFQ operations are logged for audit
- RFQ assignments trigger email notifications
- Budget and deadline validations are enforced
- RFQ analytics are calculated in real-time
- All timestamps are in ISO 8601 format
