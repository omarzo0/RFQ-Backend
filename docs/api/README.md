# RFQ Backend API Documentation

## Overview

This directory contains comprehensive API documentation for the RFQ Backend system, organized by user type and functionality.

## Documentation Structure

### Admin APIs

- **[Admin Documentation](./admin/README.md)** - Complete admin API reference
- **Controllers:** Authentication, company management, financial operations, analytics, support

### Company APIs

- **[Company Documentation](./company/README.md)** - Complete company API reference
- **Controllers:** Authentication, RFQ management, quotes, payments, analytics, communication

## Quick Start

### Base URLs

- **Admin API:** `https://yourdomain.com/api/v1/admin`
- **Company API:** `https://yourdomain.com/api/v1/company`

### Authentication

- **Admin:** `Authorization: Bearer <admin_jwt_token>`
- **Company:** `Authorization: Bearer <company_jwt_token>`

### Common Response Format

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

## Key Features

### Trial-Based Subscription System

- Companies start with 30-day free trials
- Admin creates companies with trial plans
- Companies can only upgrade from trial to paid plans
- Automated email notifications for trial status

### Payment Integration

- Stripe payment processing
- Subscription management
- Payment method storage
- Refund processing
- Financial reporting

### Email Management

- Automated email campaigns
- Template management
- Email tracking and analytics
- Reply ingestion with AI parsing

### Analytics & Reporting

- Company-specific analytics
- Admin dashboard with system-wide metrics
- RFQ and quote tracking
- Financial summaries

## API Endpoints Summary

### Admin Endpoints

- **Authentication:** Login, profile management, password operations
- **Company Management:** CRUD operations, analytics, subscription management
- **Financial Management:** Revenue tracking, transaction management
- **Analytics:** System-wide metrics and reporting
- **Support:** Ticket management and user support

### Company Endpoints

- **Authentication:** User login, profile management, password operations
- **RFQ Management:** Create, manage, and track RFQs
- **Quote Management:** Generate and manage quotes
- **Payment Processing:** Subscription upgrades, payment methods, refunds
- **Communication:** Email campaigns, templates, reply processing
- **Analytics:** Company-specific metrics and reporting

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "statusCode": 400
}
```

## Rate Limiting

- API calls are rate-limited per user
- Admin endpoints have higher rate limits
- Company endpoints are rate-limited per company

## Security

- JWT token authentication
- Company data isolation
- Admin role-based access control
- All operations are logged for audit

## Support

For API support and questions:

1. Check the specific controller documentation
2. Review error responses and status codes
3. Contact system administrator for technical issues

## Versioning

- Current API version: v1
- Version is included in the base URL
- Backward compatibility is maintained within major versions
