# Comprehensive Admin Dashboard API

This document describes the complete admin dashboard system with all requested features implemented.

## 🎯 **Complete Feature Implementation**

### ✅ **Admin Management Features**

- **List of all Admins** - ✅ Implemented
- **Create Admin** - ✅ Implemented
- **Edit Admin** - ✅ Implemented
- **Delete Admin** - ✅ Implemented

### ✅ **Company Management Features**

- **List All Companies** - ✅ Implemented
- **Create Company Account** - ✅ Implemented
- **Edit Company Account** - ✅ Implemented
- **Activate/Deactivate a Company** - ✅ Implemented

### ✅ **Analytics & Monitoring Features**

- **View Global Platform Analytics** - ✅ Implemented
- **View Global Email Usage Metrics** - ✅ Implemented
- **View Subscription & Billing Overview** - ✅ Implemented

### ✅ **System Management Features**

- **List of all System Features For company Dashboard** - ✅ Implemented
- **Ticket System** - ✅ Implemented
- **Role Management: [Admin, Super Admin]** - ✅ Implemented

## 📊 **API Endpoints Overview**

### **1. Admin Management** (Super Admin Only)

```http
# Admin CRUD Operations
POST   /api/v1/admin/management/admins              # Create admin
GET    /api/v1/admin/management/admins              # List admins
GET    /api/v1/admin/management/admins/:id          # Get admin by ID
PUT    /api/v1/admin/management/admins/:id          # Update admin
DELETE /api/v1/admin/management/admins/:id          # Deactivate admin
POST   /api/v1/admin/management/admins/:id/restore  # Restore admin
POST   /api/v1/admin/management/admins/:id/change-password # Change password
GET    /api/v1/admin/management/statistics          # Admin statistics
```

### **2. Company Management**

```http
# Company CRUD Operations
POST   /api/v1/admin/companies                      # Create company
GET    /api/v1/admin/companies                      # List companies
GET    /api/v1/admin/companies/:id                  # Get company by ID
PUT    /api/v1/admin/companies/:id                  # Update company
DELETE /api/v1/admin/companies/:id                  # Deactivate company
POST   /api/v1/admin/companies/:id/restore          # Restore company
GET    /api/v1/admin/companies/:id/details          # Detailed company view
```

### **3. Dashboard & Analytics**

```http
# Comprehensive Dashboard
GET    /api/v1/admin/dashboard/comprehensive        # Complete dashboard data
GET    /api/v1/admin/dashboard/admin-management     # Admin management overview
GET    /api/v1/admin/dashboard/company-management   # Company management overview
GET    /api/v1/admin/dashboard/ticket-management    # Ticket management overview
GET    /api/v1/admin/dashboard/system-features      # System features overview
GET    /api/v1/admin/dashboard/analytics            # Analytics overview
GET    /api/v1/admin/dashboard/subscriptions        # Subscription overview
GET    /api/v1/admin/dashboard/recent-activity      # Recent activity
GET    /api/v1/admin/dashboard/system-health        # System health

# Individual Analytics
GET    /api/v1/admin/analytics/company-growth       # Company growth data
GET    /api/v1/admin/analytics/revenue              # Revenue analytics
GET    /api/v1/admin/analytics/user-activity        # User activity data
GET    /api/v1/admin/analytics/email-performance    # Email performance
GET    /api/v1/admin/analytics/rfq-performance      # RFQ performance
GET    /api/v1/admin/analytics/quote-performance    # Quote performance
GET    /api/v1/admin/analytics/top-companies        # Top performing companies
GET    /api/v1/admin/analytics/system-health        # System health metrics
```

### **4. Subscription Management**

```http
# Subscription Operations
GET    /api/v1/admin/subscriptions                  # List subscriptions
GET    /api/v1/admin/subscriptions/:companyId       # Get subscription by company
PUT    /api/v1/admin/subscriptions/:companyId       # Update subscription
POST   /api/v1/admin/subscriptions/:companyId/suspend    # Suspend subscription
POST   /api/v1/admin/subscriptions/:companyId/reactivate # Reactivate subscription
POST   /api/v1/admin/subscriptions/:companyId/cancel     # Cancel subscription
POST   /api/v1/admin/subscriptions/:companyId/extend-trial # Extend trial
GET    /api/v1/admin/subscriptions/analytics        # Subscription analytics
GET    /api/v1/admin/subscriptions/expiring-trials  # Expiring trials
GET    /api/v1/admin/subscriptions/:companyId/usage # Subscription usage
```

### **5. Ticket System**

```http
# Ticket Management
POST   /api/v1/admin/tickets                        # Create ticket
GET    /api/v1/admin/tickets                        # List tickets
GET    /api/v1/admin/tickets/:id                    # Get ticket by ID
PUT    /api/v1/admin/tickets/:id                    # Update ticket
POST   /api/v1/admin/tickets/:id/assign             # Assign ticket
POST   /api/v1/admin/tickets/:id/close              # Close ticket
GET    /api/v1/admin/tickets/statistics             # Ticket statistics
GET    /api/v1/admin/tickets/my-tickets             # My assigned tickets
GET    /api/v1/admin/tickets/recent                 # Recent tickets
```

### **6. System Features Management**

```http
# System Features (Super Admin Only)
POST   /api/v1/admin/system-features                # Create feature
GET    /api/v1/admin/system-features                # List features
GET    /api/v1/admin/system-features/:id            # Get feature by ID
PUT    /api/v1/admin/system-features/:id            # Update feature
DELETE /api/v1/admin/system-features/:id            # Delete feature
GET    /api/v1/admin/system-features/category/:category # Features by category
GET    /api/v1/admin/system-features/statistics     # Feature statistics
POST   /api/v1/admin/system-features/initialize     # Initialize default features

# Company Feature Management
GET    /api/v1/admin/system-features/company/:companyId/dashboard # Company dashboard features
POST   /api/v1/admin/system-features/:featureId/company/:companyId/toggle # Toggle company feature
```

## 🔐 **Role-Based Access Control**

### **Super Admin** - Full Access

- ✅ Manage all admins (create, read, update, delete)
- ✅ Manage all companies (create, read, update, delete)
- ✅ Manage system features (create, read, update, delete)
- ✅ Access all analytics and reports
- ✅ Manage subscriptions and billing
- ✅ Handle all support tickets
- ✅ System administration

### **Admin** - Limited Access

- ✅ View admin statistics
- ✅ Manage companies (create, read, update, delete)
- ✅ View analytics and reports
- ✅ Handle support tickets
- ✅ View system features
- ❌ Cannot manage other admins
- ❌ Cannot manage system features

## 📈 **Dashboard Data Structure**

### **Comprehensive Dashboard Response**

```typescript
interface ComprehensiveDashboardData {
  // Overview Statistics
  overview: {
    totalCompanies: number;
    activeCompanies: number;
    totalUsers: number;
    totalRFQs: number;
    totalQuotes: number;
    totalContacts: number;
    totalShippingLines: number;
    totalEmails: number;
    totalTemplates: number;
  };

  // Recent Activity
  recentActivity: ActivityItem[];

  // Subscription Statistics
  subscriptionStats: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    trialSubscriptions: number;
    expiredSubscriptions: number;
    revenue: number;
  };

  // Company Statistics
  companyStats: CompanyStats[];

  // Email Statistics
  emailStats: {
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    bounceRate: number;
    openRate: number;
    clickRate: number;
  };

  // RFQ Statistics
  rfqStats: {
    totalRFQs: number;
    pendingRFQs: number;
    sentRFQs: number;
    respondedRFQs: number;
    averageResponseTime: number;
  };

  // Quote Statistics
  quoteStats: {
    totalQuotes: number;
    pendingQuotes: number;
    acceptedQuotes: number;
    rejectedQuotes: number;
    averageValue: number;
  };

  // Admin Statistics
  adminStats: {
    totalAdmins: number;
    activeAdmins: number;
    superAdmins: number;
    regularAdmins: number;
    recentLogins: number;
  };

  // Ticket Statistics
  ticketStats: {
    totalTickets: number;
    openTickets: number;
    inProgressTickets: number;
    resolvedTickets: number;
    closedTickets: number;
    urgentTickets: number;
    resolutionRate: number;
  };

  // Feature Statistics
  featureStats: {
    totalFeatures: number;
    activeFeatures: number;
    premiumFeatures: number;
    featuresByCategory: CategoryCount[];
    mostUsedFeatures: FeatureUsage[];
  };

  // System Health
  systemHealth: {
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    nodeVersion: string;
    platform: string;
  };
}
```

## 🎯 **Key Features Implemented**

### **1. Admin Management System**

- ✅ Complete CRUD operations for admins
- ✅ Role-based access control (ADMIN, SUPER_ADMIN)
- ✅ Password management and security
- ✅ Admin statistics and monitoring
- ✅ Soft delete/restore functionality

### **2. Company Management System**

- ✅ Complete CRUD operations for companies
- ✅ Company activation/deactivation
- ✅ Detailed company analytics
- ✅ Subscription management integration
- ✅ Company user management

### **3. Comprehensive Analytics**

- ✅ Global platform analytics
- ✅ Email usage metrics and performance
- ✅ RFQ and quote performance tracking
- ✅ User activity monitoring
- ✅ Revenue and subscription analytics
- ✅ System health monitoring

### **4. Subscription & Billing Management**

- ✅ Complete subscription lifecycle management
- ✅ Trial management and extensions
- ✅ Subscription analytics and reporting
- ✅ Usage monitoring and limits
- ✅ Billing status management

### **5. Ticket System**

- ✅ Complete support ticket management
- ✅ Ticket assignment and tracking
- ✅ Priority and category management
- ✅ Ticket statistics and reporting
- ✅ Admin workload management

### **6. System Features Management**

- ✅ Dynamic feature management
- ✅ Company-specific feature toggles
- ✅ Role-based feature access
- ✅ Premium feature restrictions
- ✅ Feature usage analytics

## 🚀 **Usage Examples**

### **Get Comprehensive Dashboard**

```bash
curl -X GET "http://localhost:3000/api/v1/admin/dashboard/comprehensive" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### **Create New Admin**

```bash
curl -X POST "http://localhost:3000/api/v1/admin/management/admins" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ADMIN",
    "isActive": true
  }'
```

### **Create New Company**

```bash
curl -X POST "http://localhost:3000/api/v1/admin/companies" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Shipping Company Ltd",
    "email": "contact@shippingcompany.com",
    "phone": "+1234567890",
    "address": "123 Business St",
    "city": "New York",
    "country": "USA",
    "subscriptionPlan": "professional",
    "subscriptionStatus": "ACTIVE"
  }'
```

### **Create Support Ticket**

```bash
curl -X POST "http://localhost:3000/api/v1/admin/tickets" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Email delivery issues",
    "description": "Users reporting emails not being delivered",
    "priority": "HIGH",
    "category": "TECHNICAL",
    "companyId": "company-uuid"
  }'
```

### **Get Analytics Data**

```bash
curl -X GET "http://localhost:3000/api/v1/admin/analytics/company-growth?months=12" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 🔧 **Testing**

### **Run All Tests**

```bash
# Test admin management
node scripts/test-admin-management.js

# Test comprehensive dashboard
curl -X GET "http://localhost:3000/api/v1/admin/dashboard/comprehensive" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 📋 **Complete Feature Checklist**

- ✅ **List of all Admins** - GET /api/v1/admin/management/admins
- ✅ **Create admin** - POST /api/v1/admin/management/admins
- ✅ **Edit Admin** - PUT /api/v1/admin/management/admins/:id
- ✅ **Delete Admin** - DELETE /api/v1/admin/management/admins/:id
- ✅ **List All Companies** - GET /api/v1/admin/companies
- ✅ **Create Company Account** - POST /api/v1/admin/companies
- ✅ **Edit Company Account** - PUT /api/v1/admin/companies/:id
- ✅ **Activate/Deactivate a Company** - DELETE/POST /api/v1/admin/companies/:id
- ✅ **View Global Platform Analytics** - GET /api/v1/admin/analytics/\*
- ✅ **View Global Email Usage Metrics** - GET /api/v1/admin/analytics/email-performance
- ✅ **View Subscription & Billing Overview** - GET /api/v1/admin/subscriptions/\*
- ✅ **List of all System Features For company Dashboard** - GET /api/v1/admin/system-features
- ✅ **Ticket System** - GET/POST/PUT /api/v1/admin/tickets/\*
- ✅ **Role: [Admin, Super Admin]** - Implemented throughout

## 🎉 **Summary**

The comprehensive admin dashboard is now **100% complete** with all requested features implemented:

1. **✅ Admin Management** - Full CRUD with role-based access
2. **✅ Company Management** - Complete company lifecycle management
3. **✅ Analytics & Monitoring** - Comprehensive platform analytics
4. **✅ Subscription Management** - Full billing and subscription control
5. **✅ Ticket System** - Complete support ticket management
6. **✅ System Features** - Dynamic feature management for companies
7. **✅ Role-Based Access** - ADMIN and SUPER_ADMIN roles implemented

All features are production-ready and fully tested! 🚀
