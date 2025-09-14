# Company Trial Notification Controller

## Overview

Handles trial notification operations for company users including manual triggers for trial warnings and expired trial checks.

## Endpoints

### 1. Check Trial Warnings

**GET** `/api/v1/company/trial-notifications/check-warnings`

**Description:** Manually check for companies with trials ending in 3 days and send warning emails

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Trial warning check completed",
  "data": {
    "message": "Trial warning check completed"
  }
}
```

**Status Codes:**

- `200` - Check completed successfully
- `401` - Unauthorized
- `500` - Internal server error

**Notes:**

- This endpoint triggers the same check that runs automatically via cron jobs
- Useful for testing and immediate execution
- Sends warning emails to companies with trials ending in 3 days

---

### 2. Check Expired Trials

**GET** `/api/v1/company/trial-notifications/check-expired`

**Description:** Manually check for companies with expired trials and send notification emails

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Trial expired check completed",
  "data": {
    "message": "Trial expired check completed"
  }
}
```

**Status Codes:**

- `200` - Check completed successfully
- `401` - Unauthorized
- `500` - Internal server error

**Notes:**

- This endpoint triggers the same check that runs automatically via cron jobs
- Useful for testing and immediate execution
- Sends expiration notification emails and deactivates expired trial accounts

---

### 3. Run All Trial Checks

**GET** `/api/v1/company/trial-notifications/run-all`

**Description:** Manually run all trial notification checks (warnings + expired)

**Headers:**

```
Authorization: Bearer <company_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "All trial notification checks completed",
  "data": {
    "message": "All trial notification checks completed"
  }
}
```

**Status Codes:**

- `200` - All checks completed successfully
- `401` - Unauthorized
- `500` - Internal server error

**Notes:**

- This endpoint runs both trial warning and expired trial checks
- Equivalent to running both individual check endpoints
- Useful for comprehensive testing and manual execution

---

## Automated Scheduling

The trial notification system also runs automatically via cron jobs:

### Daily Check (9:00 AM UTC)

- Checks for trials ending in 3 days
- Checks for expired trials
- Sends appropriate notifications

### 6-Hour Check

- More frequent monitoring
- Ensures timely notifications
- Catches edge cases

## Email Notifications

The system sends the following email types:

### Trial Ending Warning

- **Triggered:** 3 days before trial expires
- **Recipients:** Company email addresses
- **Content:** Warning about trial expiration, days remaining, upgrade encouragement

### Trial Expired Notification

- **Triggered:** When trial has expired
- **Recipients:** Company email addresses
- **Content:** Trial expiration notification, data safety assurance, upgrade call-to-action

## Error Responses

All endpoints may return the following error structure:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "statusCode": 500
}
```

## Authentication

All endpoints require a valid company JWT token in the Authorization header:

```
Authorization: Bearer <company_jwt_token>
```

## Notes

- These endpoints are primarily for testing and manual execution
- The system runs automatically via cron jobs for production use
- All email operations are logged for debugging
- Failed email sends don't break the notification process
- Company accounts are automatically deactivated when trials expire
