# Company API Documentation

## Overview

This directory contains comprehensive API documentation for all company endpoints in the RFQ Backend system.

## Controllers

### Authentication & User Management

- **[CompanyAuthController.md](./CompanyAuthController.md)** - Company user authentication, login, profile management
- **[UserController.md](./UserController.md)** - Company user management and operations
- **[CompanyPasswordResetController.md](./CompanyPasswordResetController.md)** - Password reset operations

### Core Business Operations

- **[CompanyController.md](./CompanyController.md)** - Company profile and settings management
- **[RFQController.md](./RFQController.md)** - RFQ creation, management, and tracking
- **[QuoteController.md](./QuoteController.md)** - Quote management and operations
- **[ContactController.md](./ContactController.md)** - Contact management and CRM operations

### Communication & Templates

- **[EmailController.md](./EmailController.md)** - Email management and campaigns
- **[TemplateController.md](./TemplateController.md)** - Template management for emails and quotes
- **[ReplyIngestionController.md](./ReplyIngestionController.md)** - Email reply processing and AI parsing

### Analytics & Reporting

- **[AnalyticsController.md](./AnalyticsController.md)** - Company analytics and reporting

### Payment & Subscription

- **[PaymentController.md](./PaymentController.md)** - Payment processing, subscriptions, and financial management
- **[TrialNotificationController.md](./TrialNotificationController.md)** - Trial notification management

### Support & Operations

- **[CompanyTicketController.md](./CompanyTicketController.md)** - Support ticket management
- **[ShippingLineController.md](./ShippingLineController.md)** - Shipping line management

## Base URL

```
https://yourdomain.com/api/v1/company
```

## Authentication

Most company endpoints require a valid company JWT token:

```
Authorization: Bearer <company_jwt_token>
```

## Common Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "statusCode": 400
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Key Features

### Trial System

- Companies start with 30-day free trials
- Trial notifications sent 3 days before expiration
- Automatic account deactivation when trials expire
- Upgrade to paid plans from trial status

### Payment Integration

- Stripe payment processing
- Subscription management
- Payment method storage
- Refund processing
- Financial reporting

### Email System

- Automated email campaigns
- Template management
- Email tracking and analytics
- Reply ingestion with AI parsing

### Analytics

- Company-specific analytics
- RFQ and quote tracking
- Email performance metrics
- Financial summaries

## Notes

- All company operations are isolated by company ID
- Pagination is supported for list endpoints
- Search and filtering options are available for most endpoints
- All timestamps are in ISO 8601 format
- Email notifications are sent for important events
