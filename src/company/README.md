# Company Module

This module handles all company user-related functionality including authentication and company-specific business operations.

## Structure

```
src/company/
├── controllers/          # Company controllers
│   ├── AnalyticsController.ts
│   ├── CompanyAuthController.ts
│   ├── ContactController.ts
│   ├── EmailController.ts
│   ├── QuoteController.ts
│   ├── RFQController.ts
│   ├── ShippingLineController.ts
│   ├── TemplateController.ts
│   └── UserController.ts
├── middleware/           # Company-specific middleware
│   └── companyAuth.ts
├── routes/              # Company routes
│   ├── analytics.ts
│   ├── companyAuth.ts
│   ├── contacts.ts
│   ├── emails.ts
│   ├── index.ts
│   ├── quotes.ts
│   ├── reply-ingestion.ts
│   ├── rfqs.ts
│   ├── shipping-lines.ts
│   ├── templates.ts
│   └── users.ts
├── services/            # Company business logic
│   ├── AIParsingService.ts
│   ├── AnalyticsService.ts
│   ├── CompanyAuthService.ts
│   ├── ContactService.ts
│   ├── EmailCampaignService.ts
│   ├── EmailReplyService.ts
│   ├── EmailService.ts
│   ├── EmailTemplateService.ts
│   ├── FollowUpService.ts
│   ├── IMAPService.ts
│   ├── QuoteService.ts
│   ├── RFQService.ts
│   ├── ShippingLineService.ts
│   ├── TemplateService.ts
│   ├── ThreadMatchingService.ts
│   ├── UserService.ts
│   └── WebhookService.ts
└── types/               # Company type definitions
    └── auth.ts
```

## Features

### Authentication

- Company user login with email/password
- JWT token-based authentication
- Role-based access control (ADMIN, MANAGER, EMPLOYEE)
- Password change functionality
- Token refresh mechanism
- Company subscription validation

### Business Operations

- **RFQ Management**: Create, read, update, delete RFQs
- **Quote Management**: Handle quotes from shipping lines
- **Contact Management**: Manage shipping line contacts
- **Email Management**: Send and track emails
- **Template Management**: Manage email and RFQ templates
- **Analytics**: Company-specific analytics and reporting
- **User Management**: Manage company users
- **Shipping Line Management**: Manage shipping line data

### Roles

- **ADMIN**: Full access to company features
- **MANAGER**: Access to most company features
- **EMPLOYEE**: Limited access to company features

## API Endpoints

### Authentication

- `POST /api/v1/company/auth/login` - Company user login
- `POST /api/v1/company/auth/refresh-token` - Refresh access token
- `GET /api/v1/company/auth/profile` - Get user profile
- `POST /api/v1/company/auth/change-password` - Change password
- `POST /api/v1/company/auth/logout` - Logout

### Business Operations

- `GET /api/v1/company/contacts` - List contacts
- `POST /api/v1/company/contacts` - Create contact
- `GET /api/v1/company/contacts/:id` - Get contact details
- `PUT /api/v1/company/contacts/:id` - Update contact
- `DELETE /api/v1/company/contacts/:id` - Delete contact

- `GET /api/v1/company/rfqs` - List RFQs
- `POST /api/v1/company/rfqs` - Create RFQ
- `GET /api/v1/company/rfqs/:id` - Get RFQ details
- `PUT /api/v1/company/rfqs/:id` - Update RFQ
- `DELETE /api/v1/company/rfqs/:id` - Delete RFQ

- `GET /api/v1/company/quotes` - List quotes
- `POST /api/v1/company/quotes` - Create quote
- `GET /api/v1/company/quotes/:id` - Get quote details
- `PUT /api/v1/company/quotes/:id` - Update quote
- `DELETE /api/v1/company/quotes/:id` - Delete quote

- `GET /api/v1/company/emails` - List emails
- `POST /api/v1/company/emails` - Send email
- `GET /api/v1/company/emails/:id` - Get email details

- `GET /api/v1/company/templates` - List templates
- `POST /api/v1/company/templates` - Create template
- `GET /api/v1/company/templates/:id` - Get template details
- `PUT /api/v1/company/templates/:id` - Update template
- `DELETE /api/v1/company/templates/:id` - Delete template

- `GET /api/v1/company/users` - List company users
- `POST /api/v1/company/users` - Create company user
- `GET /api/v1/company/users/:id` - Get user details
- `PUT /api/v1/company/users/:id` - Update user
- `DELETE /api/v1/company/users/:id` - Delete user

- `GET /api/v1/company/shipping-lines` - List shipping lines
- `POST /api/v1/company/shipping-lines` - Create shipping line
- `GET /api/v1/company/shipping-lines/:id` - Get shipping line details
- `PUT /api/v1/company/shipping-lines/:id` - Update shipping line
- `DELETE /api/v1/company/shipping-lines/:id` - Delete shipping line

- `GET /api/v1/company/analytics` - Get analytics data

## Usage

### Authentication Flow

1. Company user logs in via `/api/v1/company/auth/login`
2. Receives access token and refresh token
3. Uses access token in Authorization header for protected routes
4. Refreshes token when needed via `/api/v1/company/auth/refresh-token`

### Middleware

- `authenticateCompanyUser`: Verifies company user authentication
- `requireCompanyAdmin`: Requires ADMIN role within company
- `requireCompanyAdminOrManager`: Requires ADMIN or MANAGER role within company

### Company User Creation

Company users are created by admins through the admin panel. The first user (company admin) is created when a company is registered through the admin interface.

## Integration with Main Application

The company module is now completely separated from the main application. All company-related functionality is contained within this module, providing:

- Clear separation of concerns
- Easier maintenance and development
- Better code organization
- Independent deployment capabilities
