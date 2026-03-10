# Admin API Documentation

## Overview

This directory contains comprehensive API documentation for all admin endpoints in the RFQ Backend system.

## Controllers

### Authentication & Management

- **[AdminAuthController.md](./AdminAuthController.md)** - Admin authentication, login, profile management, and password reset
- **[AdminManagementController.md](./AdminManagementController.md)** - Admin user management and operations

### Company Management

- **[AdminCompanyController.md](./AdminCompanyController.md)** - Company CRUD operations, analytics, subscription management

### Financial & Subscription Management

- **[AdminFinancialController.md](./AdminFinancialController.md)** - Financial analytics, revenue tracking, transaction management
- **[AdminSubscriptionController.md](./AdminSubscriptionController.md)** - Subscription management and monitoring
- **[AdminSubscriptionPlanController.md](./AdminSubscriptionPlanController.md)** - Subscription plan CRUD operations

### Dashboard, Analytics & Reporting

- **[AdminDashboardController.md](./AdminDashboardController.md)** - Admin dashboard data, comprehensive metrics, and analytics (consolidated from Dashboard, Comprehensive Dashboard, and Analytics controllers)

### Support & Operations

- **[AdminTicketController.md](./AdminTicketController.md)** - Support ticket management
- **[AdminTransactionController.md](./AdminTransactionController.md)** - Transaction management and reporting

## Base URL

```
https://yourdomain.com/api/v1/admin
```

## Authentication

All admin endpoints require a valid admin JWT token:

```
Authorization: Bearer <admin_jwt_token>
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

## Notes

- All admin operations are logged for audit purposes
- Pagination is supported for list endpoints
- Search and filtering options are available for most endpoints
- All timestamps are in ISO 8601 format
