# RFQ Automation Platform - API Endpoints Documentation

## Overview

This document contains all available API endpoints for the RFQ Automation Platform. The API follows RESTful conventions and uses JWT authentication.

**Base URL**: `http://localhost:3000/api/v1`

## Authentication

All endpoints (except auth endpoints) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Endpoints

### Login

- **POST** `/auth/login`
- **Description**: Authenticate user and get JWT token
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "token": "jwt-token-here",
      "user": {
        "id": "user-id",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "ADMIN"
      }
    }
  }
  ```

### Register

- **POST** `/auth/register`
- **Description**: Register new company user
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "companyName": "Company Name"
  }
  ```

### Refresh Token

- **POST** `/auth/refresh`
- **Description**: Refresh JWT token
- **Body**:
  ```json
  {
    "refreshToken": "refresh-token-here"
  }
  ```

---

## 📊 Analytics Endpoints

### Performance Metrics

- **GET** `/analytics/performance-metrics`
- **Description**: Get overall performance metrics
- **Query Parameters**:
  - `period` (optional): 7d, 30d, 90d, 1y
  - `dateFrom` (optional): Start date (YYYY-MM-DD)
  - `dateTo` (optional): End date (YYYY-MM-DD)

### RFQ Analytics

- **GET** `/analytics/rfq-analytics`
- **Description**: Get RFQ-specific analytics
- **Query Parameters**: Same as performance metrics

### Quote Analytics

- **GET** `/analytics/quote-analytics`
- **Description**: Get quote-specific analytics
- **Query Parameters**: Same as performance metrics

### Carrier Performance

- **GET** `/analytics/carrier-performance`
- **Description**: Get carrier performance metrics
- **Query Parameters**: Same as performance metrics

### Contact Engagement

- **GET** `/analytics/contact-engagement`
- **Description**: Get contact engagement metrics
- **Query Parameters**: Same as performance metrics

### Route Performance

- **GET** `/analytics/route-performance`
- **Description**: Get route performance analytics
- **Query Parameters**: Same as performance metrics

### Historical Benchmarking

- **GET** `/analytics/historical-benchmarking`
- **Description**: Get historical performance comparison
- **Query Parameters**: Same as performance metrics

### Cost Analysis

- **GET** `/analytics/cost-analysis`
- **Description**: Get cost analysis and trends
- **Query Parameters**: Same as performance metrics

### Market Intelligence

- **GET** `/analytics/market-intelligence`
- **Description**: Get market intelligence data
- **Query Parameters**: Same as performance metrics

### Export Analytics

- **POST** `/analytics/export`
- **Description**: Export analytics data
- **Body**:
  ```json
  {
    "format": "csv|pdf|excel",
    "period": "7d|30d|90d|1y",
    "metrics": ["rfq", "quotes", "carriers"]
  }
  ```

---

## 🏢 Company & Billing Endpoints

### Company Profile

- **GET** `/company/profile`
- **Description**: Get company profile information

- **PUT** `/company/profile`
- **Description**: Update company profile
- **Body**:
  ```json
  {
    "name": "Company Name",
    "website": "https://company.com",
    "phone": "+1234567890",
    "address": "Company Address",
    "industry": "Logistics"
  }
  ```

### Company Logo

- **POST** `/company/logo`
- **Description**: Upload company logo
- **Content-Type**: `multipart/form-data`
- **Body**: Form data with `logo` file

### User Preferences

- **GET** `/company/user-preferences`
- **Description**: Get user preferences

- **PUT** `/company/user-preferences`
- **Description**: Update user preferences
- **Body**:
  ```json
  {
    "defaultIncoterm": "FOB",
    "defaultCurrency": "USD",
    "emailSignature": "Best regards, John Doe",
    "notificationSettings": {
      "email": true,
      "sms": false
    }
  }
  ```

### Subscription Management

- **GET** `/company/subscription`
- **Description**: Get current subscription details

- **GET** `/company/usage`
- **Description**: Get usage metrics against plan limits

- **GET** `/company/billing-history`
- **Description**: Get billing history and invoices

### Payment Methods

- **GET** `/company/payment-methods`
- **Description**: Get payment methods

- **POST** `/company/payment-methods`
- **Description**: Add new payment method
- **Body**:

  ```json
  {
    "type": "card",
    "cardNumber": "4111111111111111",
    "expiryMonth": "12",
    "expiryYear": "2025",
    "cvv": "123"
  }
  ```

- **DELETE** `/company/payment-methods/:id`
- **Description**: Delete payment method

- **PUT** `/company/payment-methods/:id/default`
- **Description**: Set payment method as default

### API Keys

- **GET** `/company/api-keys`
- **Description**: Get API keys

- **POST** `/company/api-keys`
- **Description**: Create new API key
- **Body**:

  ```json
  {
    "name": "API Key Name",
    "permissions": ["read", "write"]
  }
  ```

- **DELETE** `/company/api-keys/:id`
- **Description**: Delete API key

### Webhooks

- **GET** `/company/webhooks`
- **Description**: Get webhook endpoints

- **POST** `/company/webhooks`
- **Description**: Create webhook endpoint
- **Body**:

  ```json
  {
    "url": "https://example.com/webhook",
    "events": ["rfq.created", "quote.received"],
    "secret": "webhook-secret"
  }
  ```

- **PUT** `/company/webhooks/:id`
- **Description**: Update webhook endpoint

- **DELETE** `/company/webhooks/:id`
- **Description**: Delete webhook endpoint

---

## 📋 RFQ Management Endpoints

### RFQ CRUD Operations

- **GET** `/rfqs`
- **Description**: Get list of RFQs with pagination and filtering
- **Query Parameters**:

  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `search` (optional): Search term
  - `status` (optional): DRAFT, SENT, CLOSED, AWARDED, EXPIRED
  - `priority` (optional): LOW, MEDIUM, HIGH, CRITICAL
  - `urgency` (optional): URGENT, NORMAL, FLEXIBLE
  - `tradeLane` (optional): Trade lane filter
  - `tag` (optional): Tag filter
  - `assignedTo` (optional): Assigned user ID
  - `createdBy` (optional): Creator user ID
  - `dateFrom` (optional): Start date filter
  - `dateTo` (optional): End date filter

- **GET** `/rfqs/:id`
- **Description**: Get RFQ by ID with full details

- **POST** `/rfqs`
- **Description**: Create new RFQ
- **Body**:

  ```json
  {
    "title": "RFQ Title",
    "description": "RFQ Description",
    "originPort": "Port of Origin",
    "destinationPort": "Port of Destination",
    "commodity": "Commodity Type",
    "containerType": "20GP|40GP|40HC",
    "containerQuantity": 1,
    "cargoWeight": 1000.5,
    "cargoVolume": 25.5,
    "incoterm": "FOB|CIF|EXW",
    "cargoReadyDate": "2024-01-15T00:00:00Z",
    "quoteDeadline": "2024-01-20T00:00:00Z",
    "shipmentUrgency": "URGENT|NORMAL|FLEXIBLE",
    "specialRequirements": "Special requirements",
    "requiredServices": ["customs", "insurance"],
    "preferredCarriers": ["Maersk", "MSC"],
    "emailSubject": "RFQ Subject",
    "emailBody": "RFQ Email Body",
    "tradeLane": "Asia-Europe",
    "estimatedValue": 50000.0,
    "currency": "USD",
    "notes": "Internal notes",
    "tags": ["urgent", "high-value"],
    "priority": "HIGH|MEDIUM|LOW|CRITICAL",
    "assignedTo": "user-id"
  }
  ```

- **PUT** `/rfqs/:id`
- **Description**: Update RFQ
- **Body**: Same as create RFQ (all fields optional)

- **DELETE** `/rfqs/:id`
- **Description**: Delete RFQ (only if no recipients or quotes)

### RFQ Status Management

- **PUT** `/rfqs/:id/status`
- **Description**: Update RFQ status
- **Body**:

  ```json
  {
    "status": "DRAFT|SENT|CLOSED|AWARDED|EXPIRED"
  }
  ```

- **PUT** `/rfqs/:id/close`
- **Description**: Close RFQ

- **PUT** `/rfqs/:id/award`
- **Description**: Award RFQ to winning quote
- **Body**:
  ```json
  {
    "winningQuoteId": "quote-id",
    "notes": "Award notes"
  }
  ```

### RFQ Operations

- **POST** `/rfqs/:id/send`
- **Description**: Send RFQ to selected contacts
- **Body**:

  ```json
  {
    "contactIds": ["contact-id-1", "contact-id-2"],
    "emailSubject": "Custom subject (optional)",
    "emailBody": "Custom body (optional)"
  }
  ```

- **GET** `/rfqs/:id/recipients`
- **Description**: Get RFQ recipients with tracking info

- **GET** `/rfqs/:id/quotes`
- **Description**: Get quotes received for RFQ

### RFQ Analytics

- **GET** `/rfqs/analytics`
- **Description**: Get RFQ-specific analytics
- **Query Parameters**:
  - `period` (optional): 7d, 30d, 90d, 1y
  - `dateFrom` (optional): Start date
  - `dateTo` (optional): End date

### RFQ Data

- **GET** `/rfqs/trade-lanes`
- **Description**: Get all trade lanes used in RFQs

- **GET** `/rfqs/tags`
- **Description**: Get all tags used in RFQs

### RFQ Templates

- **GET** `/rfqs/templates`
- **Description**: Get RFQ templates

- **POST** `/rfqs/templates`
- **Description**: Create RFQ template
- **Body**:
  ```json
  {
    "name": "Template Name",
    "description": "Template Description",
    "subjectTemplate": "Email subject template",
    "bodyTemplate": "Email body template",
    "originPort": "Default origin port",
    "destinationPort": "Default destination port",
    "commodity": "Default commodity",
    "containerType": "Default container type",
    "containerQuantity": 1,
    "cargoWeight": 1000,
    "cargoVolume": 25,
    "incoterm": "FOB",
    "specialRequirements": "Default requirements",
    "requiredServices": ["customs"],
    "isDefault": false
  }
  ```

### RFQ Utilities

- **POST** `/rfqs/duplicate/:id`
- **Description**: Duplicate existing RFQ

---

## 👥 User Management Endpoints

### User CRUD Operations

- **GET** `/users`
- **Description**: Get list of company users
- **Query Parameters**:

  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `search` (optional): Search term
  - `role` (optional): ADMIN, MANAGER, EMPLOYEE
  - `status` (optional): ACTIVE, INACTIVE

- **GET** `/users/:id`
- **Description**: Get user by ID

- **POST** `/users`
- **Description**: Create new user
- **Body**:

  ```json
  {
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "EMPLOYEE|MANAGER|ADMIN",
    "department": "Sales",
    "phone": "+1234567890"
  }
  ```

- **PUT** `/users/:id`
- **Description**: Update user
- **Body**: Same as create user (all fields optional)

- **DELETE** `/users/:id`
- **Description**: Delete user

### User Management

- **PUT** `/users/:id/status`
- **Description**: Update user status
- **Body**:

  ```json
  {
    "isActive": true
  }
  ```

- **PUT** `/users/:id/role`
- **Description**: Update user role
- **Body**:

  ```json
  {
    "role": "EMPLOYEE|MANAGER|ADMIN"
  }
  ```

- **POST** `/users/:id/reset-password`
- **Description**: Reset user password

### User Data

- **GET** `/users/roles`
- **Description**: Get available user roles

- **GET** `/users/permissions`
- **Description**: Get user permissions by role

---

## 🚢 Shipping Line Management Endpoints

### Shipping Line CRUD Operations

- **GET** `/shipping-lines`
- **Description**: Get list of shipping lines
- **Query Parameters**:

  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `search` (optional): Search term
  - `status` (optional): ACTIVE, INACTIVE
  - `tradeLane` (optional): Trade lane filter
  - `service` (optional): Service filter
  - `tag` (optional): Tag filter
  - `isCustom` (optional): true/false

- **GET** `/shipping-lines/:id`
- **Description**: Get shipping line by ID

- **POST** `/shipping-lines`
- **Description**: Create new shipping line
- **Body**:

  ```json
  {
    "name": "Shipping Line Name",
    "code": "SLN",
    "scacCode": "SCAC",
    "website": "https://shippingline.com",
    "headquartersLocation": "City, Country",
    "headquartersCountry": "Country",
    "description": "Description",
    "notes": "Internal notes",
    "tags": ["reliable", "fast"],
    "tradeLanes": ["Asia-Europe", "Trans-Pacific"],
    "services": ["FCL", "LCL"],
    "specialization": "Container shipping",
    "reliability": 5,
    "serviceQuality": 4,
    "isCustom": false
  }
  ```

- **PUT** `/shipping-lines/:id`
- **Description**: Update shipping line
- **Body**: Same as create shipping line (all fields optional)

- **DELETE** `/shipping-lines/:id`
- **Description**: Delete shipping line

### Shipping Line Management

- **PUT** `/shipping-lines/:id/status`
- **Description**: Update shipping line status
- **Body**:

  ```json
  {
    "isActive": true
  }
  ```

- **PUT** `/shipping-lines/:id/archive`
- **Description**: Archive shipping line

- **PUT** `/shipping-lines/:id/restore`
- **Description**: Restore archived shipping line

### Shipping Line Data

- **GET** `/shipping-lines/trade-lanes`
- **Description**: Get all trade lanes

- **GET** `/shipping-lines/services`
- **Description**: Get all services

- **GET** `/shipping-lines/tags`
- **Description**: Get all tags

### Bulk Operations

- **POST** `/shipping-lines/bulk-import`
- **Description**: Bulk import shipping lines
- **Body**:
  ```json
  [
    {
      "name": "Shipping Line 1",
      "code": "SL1"
      // ... other fields
    },
    {
      "name": "Shipping Line 2",
      "code": "SL2"
      // ... other fields
    }
  ]
  ```

---

## 📋 Template Management Endpoints

### Template CRUD Operations

- **GET** `/templates`
- **Description**: Get list of templates with pagination and filtering
- **Query Parameters**:

  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `search` (optional): Search term
  - `category` (optional): Template category filter
  - `tradeLane` (optional): Trade lane filter
  - `language` (optional): Language filter
  - `isPublic` (optional): Public/private filter
  - `isActive` (optional): Active/inactive filter
  - `tags` (optional): Tag filter (comma-separated)
  - `createdBy` (optional): Creator user ID
  - `sortBy` (optional): Sort field (default: createdAt)
  - `sortOrder` (optional): Sort order (asc/desc, default: desc)

- **GET** `/templates/:id`
- **Description**: Get template by ID with full details

- **POST** `/templates`
- **Description**: Create new template
- **Body**:

  ```json
  {
    "name": "Template Name",
    "description": "Template Description",
    "subjectTemplate": "Email subject template with {{variables}}",
    "bodyTemplate": "Email body template with {{variables}}",
    "originPort": "Default origin port",
    "destinationPort": "Default destination port",
    "commodity": "Default commodity",
    "containerType": "Default container type",
    "containerQuantity": 1,
    "cargoWeight": 1000,
    "cargoVolume": 25,
    "incoterm": "FOB",
    "specialRequirements": "Default requirements",
    "requiredServices": ["customs", "insurance"],
    "isDefault": false,
    "category": "Asia-Europe",
    "tradeLane": "Asia-Europe",
    "language": "en",
    "dynamicFields": {
      "originPort": "{{originPort}}",
      "destinationPort": "{{destinationPort}}"
    },
    "templateVariables": ["originPort", "destinationPort", "commodity"],
    "isPublic": false,
    "tags": ["standard", "fcl"],
    "version": 1,
    "parentTemplateId": "parent-template-id",
    "isActive": true
  }
  ```

- **PUT** `/templates/:id`
- **Description**: Update template
- **Body**: Same as create template (all fields optional)

- **DELETE** `/templates/:id`
- **Description**: Delete template (only if no child templates)

### Template Operations

- **POST** `/templates/:id/duplicate`
- **Description**: Duplicate existing template
- **Body**:

  ```json
  {
    "name": "New Template Name (optional)",
    "description": "New Description (optional)"
  }
  ```

- **POST** `/templates/:id/use`
- **Description**: Use template to create RFQ data
- **Body**:

  ```json
  {
    "variables": {
      "originPort": "Shanghai",
      "destinationPort": "Los Angeles",
      "commodity": "Electronics"
    }
  }
  ```

- **POST** `/templates/from-rfq/:rfqId`
- **Description**: Create template from existing RFQ
- **Body**:

  ```json
  {
    "name": "Template Name",
    "description": "Template Description",
    "category": "Asia-Europe",
    "tags": ["standard", "electronics"]
  }
  ```

### Template Management

- **PUT** `/templates/:id/status`
- **Description**: Update template status
- **Body**:

  ```json
  {
    "isActive": true
  }
  ```

- **PUT** `/templates/:id/default`
- **Description**: Set template as default

### Template Data

- **GET** `/templates/categories`
- **Description**: Get all template categories

- **GET** `/templates/languages`
- **Description**: Get supported languages

- **GET** `/templates/tags`
- **Description**: Get all template tags

- **GET** `/templates/trade-lanes`
- **Description**: Get all trade lanes used in templates

### Template Analytics

- **GET** `/templates/analytics`
- **Description**: Get template analytics
- **Query Parameters**:
  - `period` (optional): 7d, 30d, 90d, 1y
  - `dateFrom` (optional): Start date
  - `dateTo` (optional): End date

### Public Templates

- **GET** `/templates/public`
- **Description**: Get public templates
- **Query Parameters**:

  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `search` (optional): Search term
  - `category` (optional): Category filter
  - `tradeLane` (optional): Trade lane filter
  - `language` (optional): Language filter
  - `tags` (optional): Tag filter

- **POST** `/templates/:id/import`
- **Description**: Import public template to company

### Template Variables

- **GET** `/templates/:id/variables`
- **Description**: Get template variables and dynamic fields

### Bulk Operations

- **POST** `/templates/bulk-import`
- **Description**: Bulk import templates
- **Body**:

  ```json
  {
    "templates": [
      {
        "name": "Template 1",
        "description": "Description 1",
        "subjectTemplate": "Subject 1",
        "bodyTemplate": "Body 1"
        // ... other template fields
      },
      {
        "name": "Template 2",
        "description": "Description 2",
        "subjectTemplate": "Subject 2",
        "bodyTemplate": "Body 2"
        // ... other template fields
      }
    ]
  }
  ```

---

## 💰 Quote Management Endpoints

### Quote CRUD Operations

- **GET** `/quotes`
- **Description**: Get list of quotes with pagination and filtering
- **Query Parameters**:

  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `search` (optional): Search term
  - `rfqId` (optional): Filter by RFQ ID
  - `contactId` (optional): Filter by contact ID
  - `shippingLineId` (optional): Filter by shipping line ID
  - `status` (optional): Filter by quote status
  - `isWinner` (optional): Filter by winner status
  - `isAwarded` (optional): Filter by awarded status
  - `isExpired` (optional): Filter by expired status
  - `isVerified` (optional): Filter by verified status
  - `source` (optional): Filter by quote source
  - `currency` (optional): Filter by currency
  - `marketPosition` (optional): Filter by market position
  - `tags` (optional): Filter by tags (comma-separated)
  - `dateFrom` (optional): Start date filter
  - `dateTo` (optional): End date filter
  - `sortBy` (optional): Sort field (default: createdAt)
  - `sortOrder` (optional): Sort order (asc/desc, default: desc)

- **GET** `/quotes/:id`
- **Description**: Get quote by ID with full details

- **POST** `/quotes`
- **Description**: Create new quote
- **Body**:

  ```json
  {
    "rfqId": "rfq-id",
    "contactId": "contact-id",
    "shippingLineId": "shipping-line-id",
    "quoteReference": "QUOTE-2024-001",
    "quoteNumber": "INT-001",
    "oceanFreight": 1500.0,
    "currency": "USD",
    "baf": 100.0,
    "caf": 50.0,
    "securityFee": 25.0,
    "documentationFee": 75.0,
    "handlingCharges": 200.0,
    "otherCharges": {
      "customs": 150.0,
      "insurance": 100.0
    },
    "totalAmount": 2200.0,
    "validityDate": "2024-12-31T23:59:59Z",
    "paymentTerms": "30 days",
    "transitTime": "21 days",
    "freeTimeAtOrigin": 7,
    "freeTimeAtDestination": 14,
    "termsAndConditions": "Standard terms apply",
    "specialNotes": "Urgent shipment",
    "source": "MANUAL",
    "receivedDate": "2024-01-15T10:30:00Z",
    "responseTime": 24,
    "tags": ["urgent", "fcl"],
    "notes": "Internal notes",
    "attachments": ["quote.pdf"],
    "serviceQuality": 4,
    "reliability": 5,
    "communicationScore": 4,
    "overallScore": 4.3,
    "marketPosition": "competitive",
    "priceCompetitiveness": 0.8
  }
  ```

- **PUT** `/quotes/:id`
- **Description**: Update quote
- **Body**: Same as create quote (all fields optional)

- **DELETE** `/quotes/:id`
- **Description**: Delete quote

### Quote Operations

- **GET** `/quotes/rfq/:rfqId`
- **Description**: Get all quotes for a specific RFQ

- **POST** `/quotes/:id/compare`
- **Description**: Compare quotes for an RFQ
- **Response**: Quote comparison with market positioning

- **POST** `/quotes/:id/award`
- **Description**: Award quote as winner
- **Body**:

  ```json
  {
    "notes": "Best price and service quality"
  }
  ```

- **POST** `/quotes/:id/reject`
- **Description**: Reject quote
- **Body**:

  ```json
  {
    "reason": "Price too high"
  }
  ```

- **POST** `/quotes/:id/verify`
- **Description**: Verify quote accuracy

- **PUT** `/quotes/:id/status`
- **Description**: Update quote status
- **Body**:
  ```json
  {
    "status": "ACTIVE"
  }
  ```

### Quote Analytics & Intelligence

- **GET** `/quotes/analytics`
- **Description**: Get quote analytics
- **Query Parameters**:

  - `period` (optional): 7d, 30d, 90d, 1y
  - `dateFrom` (optional): Start date
  - `dateTo` (optional): End date
  - `rfqId` (optional): Filter by RFQ

- **GET** `/quotes/price-analysis`
- **Description**: Get price analysis and market positioning
- **Query Parameters**:

  - `rfqId` (optional): Filter by RFQ
  - `period` (optional): Time period
  - `dateFrom` (optional): Start date
  - `dateTo` (optional): End date

- **GET** `/quotes/carrier-performance`
- **Description**: Get carrier performance metrics
- **Query Parameters**:

  - `period` (optional): Time period
  - `dateFrom` (optional): Start date
  - `dateTo` (optional): End date

- **GET** `/quotes/market-trends`
- **Description**: Get market trends and pricing analysis
- **Query Parameters**:

  - `period` (optional): Time period
  - `dateFrom` (optional): Start date
  - `dateTo` (optional): End date
  - `route` (optional): Filter by route

- **GET** `/quotes/historical-comparison`
- **Description**: Compare current quotes with historical pricing
- **Query Parameters**:

  - `rfqId` (required): RFQ ID
  - `period` (optional): Historical period

- **GET** `/quotes/rate-optimization`
- **Description**: Get rate optimization suggestions
- **Query Parameters**:
  - `rfqId` (optional): Filter by RFQ
  - `route` (optional): Filter by route

### Quote Data

- **GET** `/quotes/tags`
- **Description**: Get all quote tags

- **GET** `/quotes/currencies`
- **Description**: Get all currencies used in quotes

### Bulk Operations

- **POST** `/quotes/bulk-import`
- **Description**: Bulk import quotes
- **Body**:

  ```json
  {
    "quotes": [
      {
        "rfqId": "rfq-1",
        "contactId": "contact-1",
        "shippingLineId": "line-1",
        "totalAmount": 1500.0,
        "validityDate": "2024-12-31T23:59:59Z"
      }
    ]
  }
  ```

- **POST** `/quotes/:id/duplicate`
- **Description**: Duplicate quote for different RFQ/contact
- **Body**:
  ```json
  {
    "rfqId": "new-rfq-id",
    "contactId": "new-contact-id"
  }
  ```

### Special Operations

- **GET** `/quotes/expired`
- **Description**: Get expired quotes
- **Query Parameters**:

  - `page` (optional): Page number
  - `limit` (optional): Items per page

- **POST** `/quotes/validate`
- **Description**: Validate quote data
- **Body**: Quote data to validate
- **Response**:
  ```json
  {
    "isValid": true,
    "errors": [],
    "warnings": ["Validity date is in the past"]
  }
  ```

---

## 📞 Contact Management Endpoints

### Contact CRUD Operations

- **GET** `/contacts`
- **Description**: Get list of contacts
- **Query Parameters**:

  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `search` (optional): Search term
  - `status` (optional): ACTIVE, INACTIVE, ARCHIVED
  - `shippingLineId` (optional): Shipping line filter
  - `department` (optional): Department filter
  - `tag` (optional): Tag filter
  - `seniority` (optional): Junior, Mid, Senior, Executive
  - `specialization` (optional): Specialization filter
  - `isPrimary` (optional): true/false
  - `doNotContact` (optional): true/false

- **GET** `/contacts/:id`
- **Description**: Get contact by ID

- **POST** `/contacts`
- **Description**: Create new contact
- **Body**:

  ```json
  {
    "shippingLineId": "shipping-line-id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@shippingline.com",
    "phone": "+1234567890",
    "jobTitle": "Sales Manager",
    "department": "Sales",
    "tags": ["key-contact", "decision-maker"],
    "notes": "Contact notes",
    "seniority": "Senior|Mid|Junior|Executive",
    "specialization": "Container shipping",
    "reliability": 5,
    "isPrimary": false,
    "doNotContact": false
  }
  ```

- **PUT** `/contacts/:id`
- **Description**: Update contact
- **Body**: Same as create contact (all fields optional)

- **DELETE** `/contacts/:id`
- **Description**: Delete contact

### Contact Management

- **PUT** `/contacts/:id/status`
- **Description**: Update contact status
- **Body**:

  ```json
  {
    "isActive": true
  }
  ```

- **PUT** `/contacts/:id/do-not-contact`
- **Description**: Update do not contact flag
- **Body**:

  ```json
  {
    "doNotContact": true
  }
  ```

- **PUT** `/contacts/:id/primary`
- **Description**: Set as primary contact for shipping line
- **Body**:

  ```json
  {
    "shippingLineId": "shipping-line-id"
  }
  ```

- **PUT** `/contacts/:id/archive`
- **Description**: Archive contact

- **PUT** `/contacts/:id/restore`
- **Description**: Restore archived contact

### Contact Data

- **GET** `/contacts/departments`
- **Description**: Get all departments

- **GET** `/contacts/tags`
- **Description**: Get all contact tags

- **GET** `/contacts/seniority-levels`
- **Description**: Get seniority levels

- **GET** `/contacts/specializations`
- **Description**: Get specializations

### Bulk Operations

- **POST** `/contacts/bulk-import`
- **Description**: Bulk import contacts
- **Body**:
  ```json
  [
    {
      "shippingLineId": "shipping-line-id",
      "firstName": "Contact 1",
      "lastName": "Name",
      "email": "contact1@example.com"
      // ... other fields
    }
  ]
  ```

### Performance Analytics

- **GET** `/contacts/performance-stats`
- **Description**: Get contact performance statistics

---

## 📈 Response Formats

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

### Pagination Response

```json
{
  "success": true,
  "data": [
    // Array of items
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

---

## 🔒 Authentication & Authorization

### User Roles

- **ADMIN**: Full access to all features
- **MANAGER**: Access to RFQ management, analytics, team oversight
- **EMPLOYEE**: Access to RFQ operations, contact management (limited)

### Permissions

- `users:read` - View users
- `users:write` - Create/update users
- `users:delete` - Delete users
- `rfqs:read` - View RFQs
- `rfqs:write` - Create/update RFQs
- `rfqs:delete` - Delete RFQs
- `contacts:read` - View contacts
- `contacts:write` - Create/update contacts
- `contacts:delete` - Delete contacts
- `shipping-lines:read` - View shipping lines
- `shipping-lines:write` - Create/update shipping lines
- `shipping-lines:delete` - Delete shipping lines
- `analytics:read` - View analytics
- `company:read` - View company settings
- `company:write` - Update company settings

---

## 📝 Notes

1. **Rate Limiting**: API is rate limited to prevent abuse
2. **CORS**: Cross-origin requests are enabled for frontend
3. **File Uploads**: Use `multipart/form-data` for file uploads
4. **Date Formats**: Use ISO 8601 format for dates (YYYY-MM-DDTHH:mm:ssZ)
5. **Pagination**: Default page size is 10, maximum is 100
6. **Search**: Search is case-insensitive and searches across multiple fields
7. **Filtering**: Multiple filters can be combined using query parameters

---

## 🚀 Getting Started

1. **Start the backend server**:

   ```bash
   cd RFQ-Backend
   npm run dev
   ```

2. **Test the API**:

   ```bash
   curl -X GET http://localhost:3000/api/v1/
   ```

3. **Authenticate**:

   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"password123"}'
   ```

4. **Use the token**:
   ```bash
   curl -X GET http://localhost:3000/api/v1/rfqs \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

---

_Last updated: $(date)_
_Version: 1.0.0_
