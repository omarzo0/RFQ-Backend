# Admin Module

This module handles all admin-related functionality including authentication, company management, and dashboard operations.

## Structure

```
src/admin/
├── controllers/          # Admin controllers
│   ├── AdminAuthController.ts
│   └── AdminCompanyController.ts
├── middleware/           # Admin-specific middleware
│   └── adminAuth.ts
├── routes/              # Admin routes
│   ├── adminAuth.ts
│   ├── adminCompany.ts
│   └── index.ts
├── services/            # Admin business logic
│   ├── AdminAuthService.ts
│   └── AdminCompanyService.ts
├── types/               # Admin type definitions
│   └── auth.ts
└── scripts/             # Admin utility scripts
    └── createSuperAdmin.ts
```

## Features

### Authentication

- Admin login with email/password
- JWT token-based authentication
- Role-based access control (ADMIN, SUPER_ADMIN)
- Password change functionality
- Token refresh mechanism

### Company Management

- Create new companies
- List companies with pagination and search
- View company details
- Update company information
- Soft delete/restore companies
- Dashboard statistics

### Roles

- **ADMIN**: Can manage companies and view dashboard
- **SUPER_ADMIN**: Full access to all admin features

## API Endpoints

### Authentication

- `POST /api/v1/admin/auth/login` - Admin login
- `POST /api/v1/admin/auth/refresh-token` - Refresh access token
- `GET /api/v1/admin/auth/profile` - Get admin profile
- `POST /api/v1/admin/auth/change-password` - Change password
- `POST /api/v1/admin/auth/logout` - Logout

### Company Management

- `GET /api/v1/admin/dashboard/stats` - Get dashboard statistics
- `POST /api/v1/admin/companies` - Create company (ADMIN/SUPER_ADMIN)
- `GET /api/v1/admin/companies` - List companies
- `GET /api/v1/admin/companies/:id` - Get company details
- `PUT /api/v1/admin/companies/:id` - Update company (ADMIN/SUPER_ADMIN)
- `DELETE /api/v1/admin/companies/:id` - Delete company (ADMIN/SUPER_ADMIN)
- `POST /api/v1/admin/companies/:id/restore` - Restore company (ADMIN/SUPER_ADMIN)

## Usage

### Creating a Super Admin

Run the following command to create a super admin user:

```bash
npm run create-super-admin
```

This will create a super admin with:

- Email: superadmin@rfqplatform.com
- Password: admin123

**Important**: Change the password in production!

### Authentication Flow

1. Admin logs in via `/api/v1/admin/auth/login`
2. Receives access token and refresh token
3. Uses access token in Authorization header for protected routes
4. Refreshes token when needed via `/api/v1/admin/auth/refresh-token`

### Middleware

- `authenticateAdmin`: Verifies admin authentication
- `requireSuperAdmin`: Requires SUPER_ADMIN role
- `requireAdminOrSuperAdmin`: Requires ADMIN or SUPER_ADMIN role
