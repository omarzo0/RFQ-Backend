# Admin Ticket Controller

## Overview

Handles support ticket management for admin users including ticket viewing, assignment, status updates, and resolution.

## Endpoints

### 1. Get All Support Tickets

**GET** `/api/v1/admin/tickets`

**Description:** Get all support tickets with filtering and pagination

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by ticket status
- `priority` (optional): Filter by priority level
- `category` (optional): Filter by ticket category
- `assignedTo` (optional): Filter by assigned admin
- `companyId` (optional): Filter by company
- `search` (optional): Search by subject or description

**Response:**

```json
{
  "success": true,
  "message": "Support tickets retrieved successfully",
  "data": {
    "tickets": [
      {
        "id": "ticket_123",
        "subject": "Login issues",
        "description": "Unable to login to the system",
        "status": "open",
        "priority": "high",
        "category": "technical",
        "companyId": "company_123",
        "companyName": "Tech Corp",
        "assignedTo": "admin_456",
        "assignedAdminName": "John Doe",
        "createdBy": "user_789",
        "createdByName": "Jane Smith",
        "createdAt": "2024-01-01T10:30:00.000Z",
        "updatedAt": "2024-01-01T10:30:00.000Z",
        "resolvedAt": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    },
    "summary": {
      "total": 100,
      "open": 25,
      "inProgress": 15,
      "resolved": 50,
      "closed": 10
    }
  }
}
```

**Status Codes:**

- `200` - Tickets retrieved successfully
- `401` - Unauthorized
- `500` - Internal server error

---

### 2. Get Ticket by ID

**GET** `/api/v1/admin/tickets/:id`

**Description:** Get detailed information about a specific ticket

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**

- `id`: Ticket ID

**Response:**

```json
{
  "success": true,
  "message": "Ticket retrieved successfully",
  "data": {
    "ticket": {
      "id": "ticket_123",
      "subject": "Login issues",
      "description": "Unable to login to the system",
      "status": "open",
      "priority": "high",
      "category": "technical",
      "companyId": "company_123",
      "companyName": "Tech Corp",
      "assignedTo": "admin_456",
      "assignedAdminName": "John Doe",
      "createdBy": "user_789",
      "createdByName": "Jane Smith",
      "createdAt": "2024-01-01T10:30:00.000Z",
      "updatedAt": "2024-01-01T10:30:00.000Z",
      "resolvedAt": null
    },
    "comments": [
      {
        "id": "comment_123",
        "content": "I'm looking into this issue",
        "author": "admin_456",
        "authorName": "John Doe",
        "isInternal": true,
        "createdAt": "2024-01-01T11:00:00.000Z"
      }
    ],
    "attachments": [
      {
        "id": "attachment_123",
        "filename": "screenshot.png",
        "url": "https://yourdomain.com/attachments/screenshot.png",
        "size": 1024000,
        "uploadedAt": "2024-01-01T10:30:00.000Z"
      }
    ]
  }
}
```

**Status Codes:**

- `200` - Ticket retrieved successfully
- `401` - Unauthorized
- `404` - Ticket not found
- `500` - Internal server error

---

### 3. Update Ticket Status

**PUT** `/api/v1/admin/tickets/:id/status`

**Description:** Update ticket status

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: Ticket ID

**Request Body:**

```json
{
  "status": "in_progress",
  "comment": "Working on resolving this issue"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Ticket status updated successfully",
  "data": {
    "id": "ticket_123",
    "status": "in_progress",
    "updatedAt": "2024-01-01T11:00:00.000Z",
    "comment": {
      "id": "comment_124",
      "content": "Working on resolving this issue",
      "author": "admin_456",
      "authorName": "John Doe",
      "isInternal": true,
      "createdAt": "2024-01-01T11:00:00.000Z"
    }
  }
}
```

**Status Codes:**

- `200` - Status updated successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - Ticket not found
- `500` - Internal server error

---

### 4. Assign Ticket

**PUT** `/api/v1/admin/tickets/:id/assign`

**Description:** Assign ticket to an admin

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: Ticket ID

**Request Body:**

```json
{
  "assignedTo": "admin_456",
  "comment": "Assigned to John Doe for resolution"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Ticket assigned successfully",
  "data": {
    "id": "ticket_123",
    "assignedTo": "admin_456",
    "assignedAdminName": "John Doe",
    "updatedAt": "2024-01-01T11:00:00.000Z",
    "comment": {
      "id": "comment_125",
      "content": "Assigned to John Doe for resolution",
      "author": "admin_123",
      "authorName": "Super Admin",
      "isInternal": true,
      "createdAt": "2024-01-01T11:00:00.000Z"
    }
  }
}
```

**Status Codes:**

- `200` - Ticket assigned successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - Ticket not found
- `500` - Internal server error

---

### 5. Add Comment

**POST** `/api/v1/admin/tickets/:id/comments`

**Description:** Add a comment to a ticket

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: Ticket ID

**Request Body:**

```json
{
  "content": "This issue has been resolved. Please try logging in again.",
  "isInternal": false
}
```

**Response:**

```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "comment": {
      "id": "comment_126",
      "content": "This issue has been resolved. Please try logging in again.",
      "author": "admin_456",
      "authorName": "John Doe",
      "isInternal": false,
      "createdAt": "2024-01-01T11:30:00.000Z"
    }
  }
}
```

**Status Codes:**

- `201` - Comment added successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - Ticket not found
- `500` - Internal server error

---

### 6. Resolve Ticket

**PUT** `/api/v1/admin/tickets/:id/resolve`

**Description:** Resolve a ticket

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: Ticket ID

**Request Body:**

```json
{
  "resolution": "Issue was caused by incorrect password. User has been reset and can now login.",
  "comment": "Ticket resolved successfully"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Ticket resolved successfully",
  "data": {
    "id": "ticket_123",
    "status": "resolved",
    "resolvedAt": "2024-01-01T12:00:00.000Z",
    "resolution": "Issue was caused by incorrect password. User has been reset and can now login.",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "comment": {
      "id": "comment_127",
      "content": "Ticket resolved successfully",
      "author": "admin_456",
      "authorName": "John Doe",
      "isInternal": true,
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

**Status Codes:**

- `200` - Ticket resolved successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - Ticket not found
- `500` - Internal server error

---

### 7. Close Ticket

**PUT** `/api/v1/admin/tickets/:id/close`

**Description:** Close a resolved ticket

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: Ticket ID

**Request Body:**

```json
{
  "comment": "Ticket closed after successful resolution"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Ticket closed successfully",
  "data": {
    "id": "ticket_123",
    "status": "closed",
    "closedAt": "2024-01-01T12:30:00.000Z",
    "updatedAt": "2024-01-01T12:30:00.000Z",
    "comment": {
      "id": "comment_128",
      "content": "Ticket closed after successful resolution",
      "author": "admin_456",
      "authorName": "John Doe",
      "isInternal": true,
      "createdAt": "2024-01-01T12:30:00.000Z"
    }
  }
}
```

**Status Codes:**

- `200` - Ticket closed successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `404` - Ticket not found
- `500` - Internal server error

---

### 8. Get Ticket Statistics

**GET** `/api/v1/admin/tickets/statistics`

**Description:** Get ticket statistics and metrics

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `period` (optional): Time period (7d, 30d, 90d, 1y)

**Response:**

```json
{
  "success": true,
  "message": "Ticket statistics retrieved successfully",
  "data": {
    "overview": {
      "total": 1000,
      "open": 50,
      "inProgress": 30,
      "resolved": 800,
      "closed": 120
    },
    "responseTime": {
      "average": 4.5,
      "median": 3.2,
      "target": 2.0
    },
    "resolutionTime": {
      "average": 24.5,
      "median": 18.0,
      "target": 48.0
    },
    "byPriority": [
      {
        "priority": "high",
        "count": 100,
        "averageResolutionTime": 12.5
      },
      {
        "priority": "medium",
        "count": 600,
        "averageResolutionTime": 36.0
      },
      {
        "priority": "low",
        "count": 300,
        "averageResolutionTime": 72.0
      }
    ],
    "byCategory": [
      {
        "category": "technical",
        "count": 400,
        "percentage": 40
      },
      {
        "category": "billing",
        "count": 300,
        "percentage": 30
      },
      {
        "category": "general",
        "count": 300,
        "percentage": 30
      }
    ]
  }
}
```

**Status Codes:**

- `200` - Statistics retrieved successfully
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

All endpoints require a valid admin JWT token in the Authorization header:

```
Authorization: Bearer <admin_jwt_token>
```

## Ticket Statuses

- **open**: New ticket, not yet assigned
- **in_progress**: Ticket is being worked on
- **resolved**: Issue has been resolved
- **closed**: Ticket is closed after resolution

## Ticket Priorities

- **low**: Non-urgent issues
- **medium**: Standard priority
- **high**: Urgent issues
- **critical**: Emergency issues

## Notes

- All ticket operations are logged for audit
- Comments can be marked as internal (admin-only) or public
- Ticket assignments trigger email notifications
- Resolution times are tracked for performance metrics
- Attachments are stored securely and have size limits
