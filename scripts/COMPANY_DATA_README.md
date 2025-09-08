# Company Data Creation Scripts

This directory contains scripts to create comprehensive test data for the RFQ Platform Company APIs, similar to how we create super admin users.

## 🚀 Quick Start

### Option 1: Complete Setup (Recommended)

```bash
npm run setup-company-environment
```

This will create all company data in one go.

### Option 2: Step by Step

```bash
# Step 1: Create basic company data
npm run create-company-data

# Step 2: Create additional test data
npm run create-additional-test-data
```

## 📋 What Gets Created

### 🏢 **Company Data**

- **Company**: Test Shipping Company
  - Email: `testcompany@shipping.com`
  - Domain: `testshipping.com`
  - Subscription: Premium (Active)
  - Location: New York, USA

### 👥 **Users**

- **Admin User**: `admin@testshipping.com` / `admin123`
- **Employee User**: `employee@testshipping.com` / `employee123`

### 🚢 **Shipping Lines (3)**

1. **Maersk Line** (MAEU)

   - Headquarters: Copenhagen, Denmark
   - Services: Container, Breakbulk, Reefer
   - Trade Lanes: Asia-Europe, Asia-Americas, Europe-Americas
   - Reliability: 5/5, Service Quality: 5/5

2. **MSC Mediterranean Shipping Company** (MSC)

   - Headquarters: Geneva, Switzerland
   - Services: Container, Breakbulk
   - Trade Lanes: Asia-Europe, Asia-Americas, Europe-Americas
   - Reliability: 4/5, Service Quality: 4/5

3. **CMA CGM** (CMACGM)
   - Headquarters: Marseille, France
   - Services: Container, Breakbulk, Reefer
   - Trade Lanes: Asia-Europe, Asia-Americas, Europe-Americas
   - Reliability: 4/5, Service Quality: 4/5

### 👤 **Contacts (3)**

- One contact for each shipping line
- All with seniority: SENIOR
- Specialization: Container Shipping
- Performance scores and reliability ratings

### 📄 **RFQ Templates (2)**

1. **Standard Container RFQ**

   - Route: Shanghai → Los Angeles
   - Commodity: Electronics
   - Container: 40GP
   - Default template

2. **Reefer Container RFQ**
   - Route: Rotterdam → New York
   - Commodity: Frozen Food
   - Container: 40RF
   - Temperature controlled

### 📧 **Email Templates (2)**

1. **Standard RFQ Email**

   - Template Type: RFQ
   - Default template
   - Supported tokens for personalization

2. **Follow-up Email**
   - Template Type: FOLLOW_UP
   - For automated follow-ups

### ⏰ **Follow-up Rules (2)**

1. **Standard Follow-up**

   - Days after send: 3
   - Max follow-ups: 2

2. **Urgent Follow-up**
   - Days after send: 1
   - Max follow-ups: 3

### 📋 **RFQs (4)**

1. **Electronics Container Shipment** (Draft)

   - Shanghai → Los Angeles
   - Status: DRAFT
   - Priority: MEDIUM

2. **Furniture Container Shipment** (Sent)

   - Hamburg → New York
   - Status: SENT
   - Priority: MEDIUM

3. **Reefer Container for Food Products** (Sent)

   - Rotterdam → Miami
   - Status: SENT
   - Priority: HIGH
   - Urgency: HIGH

4. **Breakbulk Machinery Shipment** (Draft)
   - Antwerp → Houston
   - Status: DRAFT
   - Priority: MEDIUM

### 💰 **Quotes (7)**

- Multiple quotes for each RFQ
- Different shipping lines and rates
- Various currencies and terms
- Realistic pricing data

### 📢 **Email Campaigns (2)**

1. **Q1 2024 RFQ Campaign**

   - Type: RFQ_BLAST
   - Status: SCHEDULED
   - Target criteria: Trade lanes and commodities

2. **Follow-up Campaign**
   - Type: FOLLOW_UP
   - Status: ACTIVE
   - Target criteria: No response contacts

### 📊 **Usage Metrics (5)**

- RFQ creation metrics
- Email sending metrics
- Quote receiving metrics
- Campaign creation metrics
- Historical data for analytics

### 📧 **Email Logs (2)**

- Sample sent emails
- Different email types (RFQ, Follow-up)
- Tracking data for analytics

## 🔧 Script Details

### `createCompanyData.ts`

Creates the basic company structure:

- Company entity
- Admin and employee users
- 3 shipping lines
- 3 contacts
- 2 RFQ templates
- 2 email templates
- 2 follow-up rules
- 1 sample RFQ with recipients
- 2 sample quotes
- Basic usage metrics

### `createAdditionalTestData.ts`

Adds more realistic test data:

- 3 additional RFQs (different types and statuses)
- 5 additional quotes
- 2 email campaigns
- Additional usage metrics
- Email logs for tracking

## 🚀 Usage with Postman

1. **Run the setup script**:

   ```bash
   npm run setup-company-environment
   ```

2. **Import Postman collection**:

   - Import `postman/company/RFQ_Company_APIs_Complete.postman_collection.json`
   - Import `postman/company/RFQ_Company_Environment.postman_environment.json`

3. **Start testing**:
   - Use the admin credentials: `admin@testshipping.com` / `admin123`
   - All APIs are ready to test with realistic data

## 📊 Data Statistics

| Data Type       | Count | Description                |
| --------------- | ----- | -------------------------- |
| Companies       | 1     | Test Shipping Company      |
| Users           | 2     | Admin + Employee           |
| Shipping Lines  | 3     | Major carriers             |
| Contacts        | 3     | One per shipping line      |
| RFQ Templates   | 2     | Standard + Reefer          |
| Email Templates | 2     | RFQ + Follow-up            |
| Follow-up Rules | 2     | Standard + Urgent          |
| RFQs            | 4     | Various types and statuses |
| Quotes          | 7     | Multiple quotes per RFQ    |
| Email Campaigns | 2     | Different campaign types   |
| Usage Metrics   | 5     | Analytics data             |
| Email Logs      | 2     | Tracking data              |

## ⚠️ Important Notes

- **Passwords**: Change all passwords in production!
- **Test Data**: All data is for testing purposes only
- **Cleanup**: Use `npm run db:reset` to clean the database
- **Environment**: Make sure your database is running and migrated

## 🔄 Reset and Recreate

To start fresh:

```bash
# Reset database
npm run db:reset

# Recreate company data
npm run setup-company-environment
```

## 🎯 Next Steps

1. **Start the server**: `npm run dev`
2. **Test with Postman**: Use the complete collection
3. **Explore the data**: Check the database with `npm run db:studio`
4. **Build your frontend**: Use the APIs to create a company dashboard

---

**🎉 Your RFQ Platform is now ready with comprehensive test data!**
